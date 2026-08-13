// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Some Linux setups (VMs, remote desktops, certain GPU drivers) fail to
    // create a DMA-BUF/GBM render buffer for WebKitGTK ("Failed to create
    // GBM buffer..."). Falling back to software rendering avoids that.
    // Respect an explicit override from the environment.
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    anydoc_app_lib::run()
}
