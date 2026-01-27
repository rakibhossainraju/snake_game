use notify::event::{DataChange, ModifyKind};
use notify::{Event, EventKind, RecursiveMode, Result, Watcher};
use std::path::Path;
use std::sync::mpsc::channel;
use std::time::{Duration, Instant};

fn main() -> Result<()> {
    let (tx, rx) = channel();

    // Use recommended_watcher to automatically select the best backend for your OS
    let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
        tx.send(res).unwrap();
    })?;

    let watch_path = Path::new("./src");
    watcher.watch(watch_path, RecursiveMode::Recursive)?;

    println!("👀 Watching {} for changes...", watch_path.display());
    println!("   - Ignoring ./src/bin");
    println!("   - Ignoring temporary files (ending in ~)");
    println!("   - Only building on .rs file saves");

    // Run initial build
    println!("🚀 Initial build...");
    run_wasm_pack_build();

    // Debounce timer
    let mut last_build = Instant::now();
    // 500ms is usually enough to catch the "double event" from atomic saves
    let debounce_duration = Duration::from_millis(500);

    for res in rx {
        match res {
            Ok(event) => {
                // 1. FILTER: Ignore unwanted paths immediately
                // We check the first path in the event (usually the file being modified)
                if let Some(path) = event.paths.first() {
                    if should_ignore(path) {
                        continue;
                    }

                    // 2. FILTER: Only listen for "Data Change" events (Content Save)
                    // This specific match corresponds to the event in your logs.
                    let is_content_change = matches!(
                        event.kind,
                        EventKind::Modify(ModifyKind::Data(DataChange::Any))
                    );

                    if is_content_change {
                        // 3. DEBOUNCE: Prevent double-firing
                        let now = Instant::now();
                        if now.duration_since(last_build) < debounce_duration {
                            continue;
                        }
                        last_build = now;

                        println!("\n💾 Save detected: {}", path.display());
                        println!("🔨 Running wasm-pack build...");

                        // Run the build
                        run_wasm_pack_build();

                        println!("👀 Waiting for next save...");
                    }
                }
            }
            Err(e) => println!("Watch error: {:?}", e),
        }
    }
    Ok(())
}

fn should_ignore(path: &Path) -> bool {
    let path_str = path.to_string_lossy();

    // Ignore the bin directory
    if path_str.contains("/src/bin/") || path_str.contains("\\src\\bin\\") {
        return true;
    }

    // Ignore temporary files (common in Linux/Vim/IntelliJ)
    // Your logs showed "wasm_command_run~", this filters that out.
    if path_str.ends_with('~') || path_str.ends_with(".tmp") {
        return true;
    }

    // OPTIONAL: Strict mode - Only allow .rs files
    // This ensures changing a README.md or .txt doesn't trigger a WASM build
    if let Some(ext) = path.extension() {
        if ext != "rs" {
            return true;
        }
    } else {
        // No extension? Ignore it.
        return true;
    }

    false
}

fn run_wasm_pack_build() {
    // Note: This blocks the loop, which is actually good here!
    // It prevents new events from processing while a build is already running.
    let output = std::process::Command::new("wasm-pack")
        .arg("build")
        .arg("--target")
        .arg("web")
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                println!("✅ Build succeeded");
            } else {
                eprintln!(
                    "❌ Build failed:\n{}",
                    String::from_utf8_lossy(&output.stderr)
                );
            }
        }
        Err(e) => eprintln!("Failed to run wasm-pack: {}", e),
    }
}
