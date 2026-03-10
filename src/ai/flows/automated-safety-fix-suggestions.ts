'use server';
/**
 * @fileOverview This file provides a Genkit flow for automatically suggesting fixes
 * for detected AI agent safety vulnerabilities or inefficiencies.
 *
 * - automatedSafetyFixSuggestions - A function that suggests fixes for AI agent issues.
 * - AutomatedSafetyFixSuggestionsInput - The input type for the automatedSafetyFixSuggestions function.
 * - AutomatedSafetyFixSuggestionsOutput - The return type for the automatedSafetyFixSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutomatedSafetyFixSuggestionsInputSchema = z.object({
  agentCode: z.string().describe('The AI agent code or configuration that contains the vulnerability.'),
  vulnerabilityDescription: z.string().describe('A detailed description of the identified vulnerability or inefficiency.'),
  vulnerabilityType: z.string().describe('The type of vulnerability (e.g., "SQL Injection Risk", "Unbounded Loop", "Cost Inefficiency").'),
  affectedFilePath: z.string().optional().describe('The file path where the vulnerability was found (e.g., "agent_db.py").'),
  affectedLineNumber: z.number().optional().describe('The line number in the file where the vulnerability was found.'),
});
export type AutomatedSafetyFixSuggestionsInput = z.infer<typeof AutomatedSafetyFixSuggestionsInputSchema>;

const AutomatedSafetyFixSuggestionsOutputSchema = z.object({
  suggestedFix: z.string().describe('The suggested code snippet or configuration change to remediate the issue.'),
  explanation: z.string().describe('An explanation of the suggested fix and how it addresses the vulnerability.'),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the suggested fix, where 100 is highly confident.'),
  isDirectlyApplicable: z.boolean().describe('True if the suggested fix can be directly applied as a code or config patch, false otherwise.'),
});
export type AutomatedSafetyFixSuggestionsOutput = z.infer<typeof AutomatedSafetyFixSuggestionsOutputSchema>;

export async function automatedSafetyFixSuggestions(input: AutomatedSafetyFixSuggestionsInput): Promise<AutomatedSafetyFixSuggestionsOutput> {
  return automatedSafetyFixSuggestionsFlow(input);
}

const automatedSafetyFixSuggestionsPrompt = ai.definePrompt({
  name: 'automatedSafetyFixSuggestionsPrompt',
  input: { schema: AutomatedSafetyFixSuggestionsInputSchema },
  output: { schema: AutomatedSafetyFixSuggestionsOutputSchema },
  prompt: `You are an expert in AI agent security, performance optimization, and code remediation.
A safety scan has detected a {{{vulnerabilityType}}} in the following AI agent code/configuration:

Agent Code:
\
{{{
{{{agentCode}}}
}}}

Vulnerability Description: {{{vulnerabilityDescription}}}
{{#if affectedFilePath}}
Affected File: {{{affectedFilePath}}}
{{/if}}
{{#if affectedLineNumber}}
Affected Line: {{{affectedLineNumber}}}
{{/if}}

Your task is to provide an automated fix suggestion.
Provide a 'suggestedFix' which is a code snippet or configuration change that directly addresses the vulnerability.
Provide an 'explanation' for your suggested fix, detailing why it works and how it mitigates the risk or improves efficiency.
Assign a 'confidenceScore' from 0 to 100, where 100 means you are highly confident in the fix.
Set 'isDirectlyApplicable' to true if the 'suggestedFix' is a concrete code or configuration block that can be directly applied (e.g., a diff or a replacement block), otherwise false (e.g., if it's a general instruction).

Ensure the 'suggestedFix' is precise and minimal, focusing only on the necessary changes.`,
});

const automatedSafetyFixSuggestionsFlow = ai.defineFlow(
  {
    name: 'automatedSafetyFixSuggestionsFlow',
    inputSchema: AutomatedSafetyFixSuggestionsInputSchema,
    outputSchema: AutomatedSafetyFixSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await automatedSafetyFixSuggestionsPrompt(input);
    return output!;
  }
);
