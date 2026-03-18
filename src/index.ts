import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const server = new Server(
  { name: "github-milestone-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_milestones",
      description: "Liste les milestones d'un repository GitHub",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du repository" },
          repo: { type: "string", description: "Nom du repository" },
          state: {
            type: "string",
            enum: ["open", "closed", "all"],
            description: "État des milestones (défaut: open)",
          },
          sort: {
            type: "string",
            enum: ["due_on", "completeness"],
            description: "Tri des milestones",
          },
          direction: {
            type: "string",
            enum: ["asc", "desc"],
            description: "Direction du tri",
          },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_milestone",
      description: "Récupère les détails d'un milestone",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du repository" },
          repo: { type: "string", description: "Nom du repository" },
          milestone_number: {
            type: "number",
            description: "Numéro du milestone",
          },
        },
        required: ["owner", "repo", "milestone_number"],
      },
    },
    {
      name: "create_milestone",
      description: "Crée un nouveau milestone dans un repository GitHub",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du repository" },
          repo: { type: "string", description: "Nom du repository" },
          title: { type: "string", description: "Titre du milestone" },
          description: {
            type: "string",
            description: "Description du milestone",
          },
          due_on: {
            type: "string",
            description: "Date d'échéance (ISO 8601, ex: 2025-12-31T00:00:00Z)",
          },
          state: {
            type: "string",
            enum: ["open", "closed"],
            description: "État du milestone",
          },
        },
        required: ["owner", "repo", "title"],
      },
    },
    {
      name: "update_milestone",
      description: "Met à jour un milestone existant",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du repository" },
          repo: { type: "string", description: "Nom du repository" },
          milestone_number: {
            type: "number",
            description: "Numéro du milestone",
          },
          title: { type: "string", description: "Nouveau titre" },
          description: { type: "string", description: "Nouvelle description" },
          due_on: {
            type: "string",
            description: "Nouvelle date d'échéance (ISO 8601)",
          },
          state: {
            type: "string",
            enum: ["open", "closed"],
            description: "Nouvel état",
          },
        },
        required: ["owner", "repo", "milestone_number"],
      },
    },
    {
      name: "delete_milestone",
      description: "Supprime un milestone",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du repository" },
          repo: { type: "string", description: "Nom du repository" },
          milestone_number: {
            type: "number",
            description: "Numéro du milestone à supprimer",
          },
        },
        required: ["owner", "repo", "milestone_number"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_milestones": {
        const { owner, repo, state = "open", sort, direction } = args as any;
        const { data } = await octokit.issues.listMilestones({
          owner,
          repo,
          state,
          sort,
          direction,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "get_milestone": {
        const { owner, repo, milestone_number } = args as any;
        const { data } = await octokit.issues.getMilestone({
          owner,
          repo,
          milestone_number,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "create_milestone": {
        const { owner, repo, title, description, due_on, state } = args as any;
        const { data } = await octokit.issues.createMilestone({
          owner,
          repo,
          title,
          description,
          due_on,
          state,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "update_milestone": {
        const { owner, repo, milestone_number, title, description, due_on, state } =
          args as any;
        const { data } = await octokit.issues.updateMilestone({
          owner,
          repo,
          milestone_number,
          title,
          description,
          due_on,
          state,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "delete_milestone": {
        const { owner, repo, milestone_number } = args as any;
        await octokit.issues.deleteMilestone({
          owner,
          repo,
          milestone_number,
        });
        return {
          content: [
            {
              type: "text",
              text: `Milestone #${milestone_number} supprimé avec succès.`,
            },
          ],
        };
      }

      default:
        throw new Error(`Outil inconnu : ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Erreur: ${error.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
