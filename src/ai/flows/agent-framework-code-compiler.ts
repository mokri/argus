'use server';
/**
 * @fileOverview A Genkit flow for compiling abstract AI agent logic into framework-specific code.
 *
 * - compileAgentFrameworkCode - A function that handles the compilation process.
 * - AgentFrameworkCodeCompilerInput - The input type for the compileAgentFrameworkCode function.
 * - AgentFrameworkCodeCompilerOutput - The return type for the compileAgentFrameworkCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgentFrameworkCodeCompilerInputSchema = z.object({
  agentDefinitionYaml: z
    .string()
    .describe('The abstract, framework-agnostic YAML-like definition of the AI agent logic.'),
  targetFramework: z
    .enum(['LangChain', 'CrewAI', 'LangGraph', 'AutoGen'])
    .describe('The target AI framework for code generation.'),
});
export type AgentFrameworkCodeCompilerInput = z.infer<
  typeof AgentFrameworkCodeCompilerInputSchema
>;

const AgentFrameworkCodeCompilerOutputSchema = z.object({
  generatedCode: z
    .string()
    .describe('The concrete, runnable code tailored to the target AI framework.'),
  framework: z.string().describe('The AI framework for which the code was generated.'),
  lineCount: z.number().describe('The number of lines in the generated code.'),
  safetyGuardrailsPreserved: z
    .boolean()
    .describe('Whether safety guardrails defined in the agent definition were preserved in the generated code.'),
});
export type AgentFrameworkCodeCompilerOutput = z.infer<
  typeof AgentFrameworkCodeCompilerOutputSchema
>;

export async function compileAgentFrameworkCode(
  input: AgentFrameworkCodeCompilerInput
): Promise<AgentFrameworkCodeCompilerOutput> {
  return agentFrameworkCodeCompilerFlow(input);
}

const agentFrameworkCodeCompilerPrompt = ai.definePrompt({
  name: 'agentFrameworkCodeCompilerPrompt',
  input: {schema: AgentFrameworkCodeCompilerInputSchema},
  output: {schema: AgentFrameworkCodeCompilerOutputSchema},
  prompt: `You are an expert AI framework compiler. Your task is to take an abstract agent definition and translate it into concrete, runnable code for a specified AI framework.

Agent Definition (YAML-like):
${'```'}
{{{agentDefinitionYaml}}}
${'```'}

Target Framework: {{{targetFramework}}}

Based on the provided abstract agent definition, generate idiomatic and runnable code for the '{{{targetFramework}}}' framework.
Ensure that any safety guardrails specified in the agent definition (e.g., 'pii_filter', 'max_iterations', 'injection_scan') are correctly implemented and preserved in the generated code.
The generated code should be syntactically correct and follow best practices for the '{{{targetFramework}}}' framework.

After generating the code, calculate the number of lines in the generated code.
Finally, determine if all safety guardrails from the input definition were successfully preserved and implemented.

Your output MUST be a JSON object.`,
});

const agentFrameworkCodeCompilerFlow = ai.defineFlow(
  {
    name: 'agentFrameworkCodeCompilerFlow',
    inputSchema: AgentFrameworkCodeCompilerInputSchema,
    outputSchema: AgentFrameworkCodeCompilerOutputSchema,
  },
  async input => {
    const {output} = await agentFrameworkCodeCompilerPrompt(input);
    return output!;
  }
);
