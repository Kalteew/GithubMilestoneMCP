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

Ajouter dans `.mcp.json` à la racine du projet :

```json
{
  "mcpServers": {
    "github-milestone-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Outils disponibles

| Outil | Description |
|---|---|
| `list_milestones` | Liste les milestones d'un repository |
| `get_milestone` | Récupère les détails d'un milestone |
| `create_milestone` | Crée un nouveau milestone |
| `update_milestone` | Met à jour un milestone existant |
| `delete_milestone` | Supprime un milestone |
