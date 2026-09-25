---
name: "[Harvest-SubAgent] In-Depth B2B Prospect Research"
description: Collect multidimensional sales intelligence on a specific target company, including official website product and positioning analysis, key decision-maker identification, customs import/export data verification, assessment of niche market trends and procurement pain points, and official contact information. Use for in-depth customer research ahead of B2B sales prospecting, supply chain development, or competitor background research.
created_by: sub_agent
main_agent_spawn_note: This skill SKILL.md can be injected into a new sub-agent by passing it in sessions_spawn.required_skills.
sub_agent_type: general
version: 1.0.0
---
## Workflow
1. **Official Website and Brand Positioning Analysis**: Visit {company_website} to identify core product lines, target customers (B2B/B2C), and brand messaging keywords, clarifying market positioning and competitive advantages. Distinguish retail channels from bulk purchasing pages.
2. **Decision-Maker and Key Contact Identification**: Use combined search engine queries and LinkedIn searches to identify the names, titles, and LinkedIn profile URLs of key decision-makers at {company_name}, such as the CEO, procurement director, and head of product development. Check their recent activity to confirm that they still work at the company and remain responsible for supply chain operations.
3. **Customs Import/Export Data Verification**: Search public customs databases or bills of lading to verify whether {company_name} has imported from {target_country}, and extract supplier names, purchasing categories, and purchase frequency. If direct database access is restricted, use advanced queries such as `site:importgenius.com "{company_name}"` to retrieve public snippets, and verify that the identified suppliers are still actively operating.
4. **Market Trends and Procurement Pain Point Assessment**: Research the latest demand trends for {specific_product_category} in the target market, such as ASTM/NFPA safety certifications and environmental standards, and infer supply chain pain points in the context of the company's business. Cross-check these inferences against existing product specifications on its official website. If the company clearly already meets a particular standard, discard that pain point and find an alternative approach.
5. **Social Media and Contact Information Consolidation**: Find the company's officially verified accounts on LinkedIn, Facebook, Instagram, and other platforms. Extract its headquarters address, customer service/procurement phone numbers, and general business email addresses from its official website, then compile a structured company research report.

## Suggestions
- Batch parallel searches: In the first search round, run multiple keyword queries for website analysis, executive identification, and customs data in parallel to reduce waiting time.
- Alternative LinkedIn routes: If company executives have no public LinkedIn profiles, use the "People" tab on the company's official LinkedIn page or professional sales databases for cross-verification.
- Validate inferred pain points: Compare inferred procurement pain points against current product specification sheets on the company's official website to ensure the hypotheses reflect actual business gaps.

## Fallback / Edge Cases
- **Customs Data Unavailable**: If the company uses confidential bills of lading or the data source has insufficient coverage, Step 3 falls back to inferring a potential supplier pool in the target country from industry trade show directories, public information on competitors' suppliers, or customs codes.
- **Strict Executive Privacy**: If Step 2 cannot identify a specific person responsible, locate a public email address for the company's general business development or procurement department and use standardized wording for outreach.

## Pitfalls
- Step 3: Public customs data often has a 3-6 month delay and may show intermediary agents rather than actual manufacturers. Use supplier names for a second check of their manufacturing credentials.
- Step 4: Market trend analysis can become too generic. Focus on technical standards specific to the company's product lines; otherwise, inferred pain points will not support targeted sales.
- Step 2: Many people on LinkedIn share the same name. Cross-check identities using company email domains or past employment history to avoid contacting the wrong person.
