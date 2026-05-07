{pkgs}: {
  deps = [
    pkgs.python312Packages.setuptools
    pkgs.ffmpeg
    pkgs.gnumake
    pkgs.gcc
    pkgs.pkg-config
    pkgs.python3
  ];
}
