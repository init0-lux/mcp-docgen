{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
    packages = [ pkgs.ollama ];

    shellHook = ''
        echo "Ollama is ready to use! 🦙🎉";
    '';
}
