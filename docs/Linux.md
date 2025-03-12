## 📌 Prérequis

- [Voir cette page pour les prérequis](https://docs.docker.com/desktop/setup/install/linux/)

## 🚀 Étape 1 : Ajouter le repo Docker qui correspond à votre distribution Linux :

??? info "Ubuntu"
    ```bash
    # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    ```

??? info "Debian"
    ```bash
    # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    ```

## 📥 Étape 2 : Télécharger le fichier .deb correspondant à votre distribution
[Voir ici](https://docs.docker.com/desktop/setup/install/linux/#where-to-go-next)


## 🏗️ Étape 5 : Mettre à jour apt et installer le fichier .deb

??? info "Ubuntu/Debian"
    ```bash
    sudo apt-get update
    sudo apt-get install ./docker-desktop-amd64.deb
    ```
