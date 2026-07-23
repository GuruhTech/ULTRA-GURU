{pkgs}: {
  deps = [
    pkgs.python312Packages.setuptools
    pkgs.gnumake
    pkgs.gcc
    pkgs.python3
  ];
}
