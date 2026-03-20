# GithubMilestoneMCP

A Model Context Protocol (MCP) server for managing GitHub Milestones.

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- Un [Personal Access Token GitHub](https://github.com/settings/tokens) avec les permissions `repo`
- [Docker](https://www.docker.com/) (optionnel, pour le container)

## Installation

```bash
npm install
```

## Configuration

Définir la variable d'environnement suivante :

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxx
```

## Lancement

### Mode développement (stdio)

```bash
npm run dev
```

### Mode production (après build)

```bash
npm run build
npm start
```

### Avec Docker

**Build de l'image :**

```bash
docker build -t github-milestone-mcp .
```

**Lancement du container :**

```bash
docker run -e GITHUB_PERSONAL_ACCESS_TOKEN github-milestone-mcp
```

## Intégration avec Claude Code

Il existe deux façons d'intégrer ce serveur MCP dans Claude Code.

### Option 1 — Via Docker (recommandé)

**1. Builder l'image Docker :**

```bash
docker build -t github-milestone-mcp .
```

**2. Ajouter la configuration dans `~/.claude.json`** (config globale, disponible dans tous les projets) :

```json
{
  "mcpServers": {
    "github-milestone-mcp": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "github-milestone-mcp"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

> **Note :** La variable `GITHUB_PERSONAL_ACCESS_TOKEN` doit être définie dans l'environnement du shell qui lance Claude Code.

### Option 2 — Via Node.js (sans Docker)

Ajouter dans `.mcp.json` à la racine d'un projet :

```json
{
  "mcpServers": {
    "github-milestone-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/chemin/vers/GithubMilestoneMCP/src/index.ts"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Nettoyage automatique du container (optionnel)

Le container Docker est lancé avec `--rm`, mais il peut arriver qu'il reste actif si Claude Code est fermé brutalement. Pour le supprimer automatiquement à chaque arrêt de Claude Code, ajouter un hook `Stop` dans `~/.claude/settings.json` :

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "docker rm -f $(docker ps -q --filter ancestor=github-milestone-mcp) 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

### Vérification

Une fois configuré, redémarrer Claude Code. Les outils `list_milestones`, `create_milestone`, etc. doivent apparaître comme disponibles.

## Outils disponibles

| Outil | Description |
|---|---|
| `list_milestones` | Liste les milestones d'un repository |
| `get_milestone` | Récupère les détails d'un milestone |
| `create_milestone` | Crée un nouveau milestone |
| `update_milestone` | Met à jour un milestone existant |
| `delete_milestone` | Supprime un milestone |
