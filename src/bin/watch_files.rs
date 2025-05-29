use notify::event::{DataChange, ModifyKind};
use notify::{Event, EventKind, RecursiveMode, Result, Watcher};
use std::path::Path;
use std::sync::mpsc::channel;
use std::time::{Duration, Instant};

fn main() -> Result<()> {
    let (tx, rx) = channel();

    let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
        tx.send(res).unwrap();
    })?;

    let watch_path = Path::new("./src");
    watcher.watch(watch_path, RecursiveMode::Recursive)?;
    println!(
        "Watching {} for changes (excluding bin directory)... (Press Ctrl+C to stop)",
        watch_path.display()
    );
    println!("initial build...");
    run_wasm_pack_build();

    // For debouncing save events
    let mut last_build = Instant::now();
    let debounce_duration = Duration::from_millis(500);

    for res in rx {
        match res {
            Ok(event) => {
                // Skip events for files in the bin directory
                if event.paths.iter().any(|path| is_in_bin_directory(path)) {
                    continue;
                }

                // Only process content modification events (file saves)
                let is_content_change = matches!(
                    event.kind,
                    EventKind::Modify(ModifyKind::Data(DataChange::Any))
                );

                if is_content_change {
                    // Check if we need to debounce (multiple save events often fire in quick succession)
                    let now = Instant::now();
                    if now.duration_since(last_build) < debounce_duration {
                        continue;
                    }
                    last_build = now;

                    println!("File saved: {}", event.paths[0].display());
                    println!("Running wasm-pack build...");

                    // Run wasm-pack build --target web
                    run_wasm_pack_build();
                }
            }
            Err(e) => println!("Watch error: {:?}", e),
        }
    }
    Ok(())
}

fn is_in_bin_directory(path: &Path) -> bool {
    path.to_string_lossy().contains("/src/bin/") || path.to_string_lossy().contains("\\src\\bin\\")
}

fn run_wasm_pack_build() {
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
