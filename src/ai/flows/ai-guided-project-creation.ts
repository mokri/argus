'use server';
/**
 * @fileOverview Provides AI-guided suggestions for project creation, including blueprints, LLMs, and frameworks.
 *
 * - aiGuidedProjectCreation - A function that suggests AI agent architecture based on a goal description.
 * - AiGuidedProjectCreationInput - The input type for the aiGuidedProjectCreation function.
 * - AiGuidedProjectCreationOutput - The return type for the aiGuidedProjectCreation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGuidedProjectCreationInputSchema = z.object({
  agentGoalDescription: z
    .string()
    .describe("A plain English description of the AI agent's goal."),
});
export type AiGuidedProjectCreationInput = z.infer<
  typeof AiGuidedProjectCreationInputSchema
>;

const AiGuidedProjectCreationOutputSchema = z.object({
  suggestedBlueprints: z
    .array(
      z.object({
        name: z
          .string()
          .describe('The name of the suggested blueprint (e.g., Supervisor Pattern, Router Pattern).'),
        description: z
          .string()
          .describe('A brief description of why this blueprint is suitable.'),
        patternType:
          z.enum(['supervisor', 'router', 'sequential', 'map-reduce'])
            .optional()
            .describe('The type of blueprint pattern.'),
      }),
    )
    .describe('A list of suggested AI agent blueprints.'),
  suggestedLlms: z
    .array(
      z.object({
        name:
          z.enum(['GPT-4o', 'GPT-4o-mini', 'Claude 3.5', 'Llama 3'])
            .describe('The name of the suggested LLM.'),
        reason: z
          .string()
          .describe('The reason why this LLM is suitable for the agent\'s goal.'),
      }),
    )
    .describe('A list of optimal LLMs for the agent\'s goal.'),
  suggestedFrameworks: z
    .array(
      z.object({
        name:
          z.enum(['LangChain', 'CrewAI', 'LangGraph', 'AutoGen'])
            .describe('The name of the suggested framework.'),
        reason: z
          .string()
          .describe('The reason why this framework is suitable for the agent\'s goal.'),
      }),
    )
    .describe('A list of optimal frameworks for the agent\'s goal.'),
  overallSummary:
    z.string().optional().describe('An overall summary of the agent\'s goal and the guiding principles for its architecture.'),
});
export type AiGuidedProjectCreationOutput = z.infer<
  typeof AiGuidedProjectCreationOutputSchema
>;

export async function aiGuidedProjectCreation(
  input: AiGuidedProjectCreationInput,
): Promise<AiGuidedProjectCreationOutput> {
  return aiGuidedProjectCreationFlow(input);
}

const aiGuidedProjectCreationPrompt = ai.definePrompt({
  name: 'aiGuidedProjectCreationPrompt',
  input: {schema: AiGuidedProjectCreationInputSchema},
  output: {schema: AiGuidedProjectCreationOutputSchema},
  prompt: `You are an expert AI architect assistant. A user has provided a plain English description of an AI agent's goal. Your task is to analyze this goal and suggest suitable AI blueprints, optimal Large Language Models (LLMs), and appropriate frameworks.

Consider the complexity, interaction patterns, data requirements, and scalability implied by the goal.

Based on the agent's goal: '{{{agentGoalDescription}}}', provide your recommendations in a structured JSON format, adhering strictly to the provided schema.

Available Blueprint Patterns and their descriptions:
- Supervisor Pattern: A manager agent delegates to specialized sub-agents.
- Router Pattern: Classifies input and routes to the right agent.
- Sequential Pattern: Agents execute one after another in a pipeline.
- Map-Reduce Pattern: Parallel agents process chunks, then merge results.

Available LLMs: GPT-4o, GPT-4o-mini, Claude 3.5, Llama 3.
Available Frameworks: LangChain, CrewAI, LangGraph, AutoGen.`,
});

const aiGuidedProjectCreationFlow = ai.defineFlow(
  {
    name: 'aiGuidedProjectCreationFlow',
    inputSchema: AiGuidedProjectCreationInputSchema,
    outputSchema: AiGuidedProjectCreationOutputSchema,
  },
  async (input) => {
    const {output} = await aiGuidedProjectCreationPrompt(input);
    return output!;
  },
);
