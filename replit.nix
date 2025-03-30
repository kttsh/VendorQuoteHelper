{pkgs}: {
  deps = [
    pkgs.openssl
    pkgs.pkg-config
    pkgs.cargo
    pkgs.rustc
  ];
}
