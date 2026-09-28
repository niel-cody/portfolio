export type Phase = 'floor' | 'across' | 'product';

export interface Role {
  from: number;
  to: number | 'now';
  role: string;
  org: string;
  phase: Phase;
  line: string;
}

/** 2004 to now. Dates as corrected in the career record; numbers only where they were measured. */
export const career: Role[] = [
  {
    from: 2024, to: 'now', role: 'Senior Product Manager', org: 'Oolio', phase: 'product',
    line: 'Five product areas: AI, menu and product management, insights, loyalty, inventory. Each with a tech lead, engineers, a product owner and QA. Member of the leadership group shaping the data strategy.',
  },
  {
    from: 2021, to: 2024, role: 'Product Manager, Customer Engagement', org: 'Bepoz, Oolio group', phase: 'product',
    line: 'Rebuilt the loyalty platform as configurable SaaS. Delivery from weeks to under one. Estate from under 10 to over 250.',
  },
  {
    from: 2015, to: 2021, role: 'International Business Development Manager', org: 'Bepoz', phase: 'product',
    line: 'Made the product fit five markets. Built QA from zero, recruited six product owners, and led the Atlassian rollout across the global teams.',
  },
  {
    from: 2012, to: 2018, role: 'Founder, hospitality consultant', org: 'BRC Mafia, London', phase: 'across',
    line: 'Six years with independent UK operators, on the floor rather than in a boardroom. Client revenue up by as much as 25%.',
  },
  {
    from: 2012, to: 2015, role: 'Senior Account Manager', org: 'Beyond Stock', phase: 'across',
    line: 'Negotiated and delivered a POS, stock and financial control rollout across a 60+ site pub group. Where I crossed the table.',
  },
  {
    from: 2010, to: 2012, role: 'Co-founder', org: 'Barmade', phase: 'floor',
    line: 'A hospitality training and recruitment company. WSET Approved Programme Provider. Client base up 25% in year one.',
  },
  {
    from: 2009, to: 2011, role: 'Head of Operations', org: 'Etive Pubs', phase: 'floor',
    line: 'Three venues, £3.5m turnover. Revenue up more than 10%, gross margin up 10%, labour cost down 12%.',
  },
  {
    from: 2008, to: 2009, role: 'Assistant General Manager', org: 'The Living Room, Islington', phase: 'floor',
    line: 'High-volume service. Peak revenue up 10%, waste down 25%.',
  },
  {
    from: 2006, to: 2008, role: 'Bar Manager', org: 'Living Ventures', phase: 'floor',
    line: 'Bar revenue up 15%. Stock variance down 1.5 points.',
  },
  {
    from: 2004, to: 2006, role: 'Head Bartender and Bar Trainer', org: 'Living Ventures', phase: 'floor',
    line: 'New-starter ramp time cut by 20 to 40% with structured onboarding.',
  },
];
