### **Deep Rewarding** Project Overview

The **Deep Rewarding** project is a mechanism designed to ensure fair and transparent reward distribution within decentralized communities. This system addresses a common problem: how to evaluate and distribute rewards equitably among various contributors in a decentralized setting. These contributors include developers, designers, documentation writers, and community organizers.

The reward mechanism is inspired by **Deep Funding** (a mechanism of public good funding proposed by Vitalik and Kevin Owocki) and uses a multi-step process for contribution evaluation and compensation:

1. Role Assignment:
   Community organizers assign roles to core contributors (e.g., developers, designers, promoters). We use a role-management protocol (currently utilizing Hats Protocol) to formalize role assignments.

2. Credit Exchange:
   Contributors can issue Assist Credits (ERC1155) to each other. This credit exchange serves as a way to express appreciation and track collaboration. For example, if a developer helps another team member, they may receive 100 Dev Assist Credits as thanks. We are also building an AI agent to remind members to exchange credits. Often, community members forget to express appreciation or to send tokens, and existing community token exchange tools have proven ineffective. For our prototype, the AI agent monitors conversations in the Telegram community group chat. When a member receives sufficient help from others, the Agent suggests sending Assist Credits to acknowledge the support.

3. Data Aggregation:
   The Assist Credit transactions are recorded on-chain, creating a rich data set of contributions.

4. Dependency Graph Generation:
   An AI agent analyzes transaction data of Assist Credit to generate multiple dependency graph patterns. These graphs visualize the interdependencies within the community, highlighting which contributors provide the most impact to others. The agent can generate hundreds of variations for human review.

5. Human Validation:
   Community members perform spot-checks to validate the generated dependency graphs, ensuring the model’s accuracy. This process safeguards against errors in the automated analysis.

6. Reward Calculation:
   Based on the validated dependency graph, the system calculates reward ratios. For example, if a DAO has a 100 USDC budget, the system might allocate 30% (30 USDC) to one key contributor and distribute the remaining amount proportionally to others.

7. Automated Distribution:
   Finally, funds are distributed using Splits Protocol, which enables transparent and immutable on-chain transactions.

This mechanism helps maintain a sustainable and collaborative DAO by:

- Incentivizing contributions through peer recognition.

- Reducing administrative overhead with automated AI-driven analysis.

- Providing a transparent process for fair reward distribution.

Our long-term vision is to expand this project to support local communities in Japan and beyond. We aim to simplify the user interface so that even non-technical users, such as older adults, can easily interact with the system to distribute funds in their own community projects.

### How **Deep Rewarding** is Made

We designed and built the **Deep Rewarding** project with a combination of blockchain, AI, and messaging technologies. The key components and technologies are described below:

1.  Blockchain and Smart Contracts:
    We utilize blockchain to record all Assist Credit transactions and manage fund distribution. This ensures transparency and accountability. The Splits Protocol facilitates on-chain distribution of funds, with all transaction history publicly verifiable.

2.  AI Agent:
    The core of the project is an AI agent responsible for analyzing transaction data and generating dependency graph patterns. This agent automates the process of identifying key contributors and calculating their reward ratios.

    - We faced significant challenges in ensuring that the AI agent generates accurate results. Initially, incorrect function outputs hindered the reward process. To address this, we implemented extensive validation and spot-checks by human reviewers.

    - The AI model is hosted on Gaia Network, which provides an OpenAI-compatible API endpoint. This allows seamless integration with our front-end and messaging systems.

3.  Role and Credit Management:
    We implemented role management using Hats Protocol, which allows us to assign and track contributor roles. Assist Credits are exchanged within this framework to maintain accountability and reward transparency.

4.  User Engagement via Telegram Bot:
    To increase engagement and ensure contributors remember to send Assist Credits, we developed a Telegram bot. This bot periodically reminds DAO members to recognize each other’s efforts by sending credits. The bot can recommend specific users based on previous interactions and contributions.

5.  Dependency Graph Generation and Visualization:
    The AI agent generates multiple patterns of dependency graphs, allowing the DAO to choose a model that best represents actual contributions. Human validation of these graphs ensures fairness and prevents manipulation.

6.  Front-End and User Experience:
    We are developing a simple and intuitive user interface to enable non-technical users to interact with the system. The UI connects with both the blockchain and AI backend, streamlining the process of credit exchange and reward distribution.

7.  Challenges Overcome:

    - Framework Selection: We encountered difficulties in choosing the right development frameworks due to the abundance of options (e.g., LangChain, LLaMA). Each framework appeared promising, but ultimately we selected tools that best fit our integration needs with Gaia Network.

    - Distributed State Management: Managing message records and states across various communication channels (e.g., Telegram) was complex. We implemented AI-based estimations to handle state management and message prioritization.

8.  Testing and Experimentation:
    We have already tested a manual version of the reward distribution system in an open-source community. The AI-driven model is currently under development, with plans for full testing by March or April. We expect to conduct additional experiments in local communities to validate the system’s effectiveness in real-world scenarios.

9.  Hacky Implementations:
    We used creative solutions to integrate different technologies. For example, we built custom connectors between Gaia Network and our Telegram bot to streamline communication. Additionally, we explored innovative ways to automate dependency graph generation, reducing the need for manual oversight.

### Future Plans and Vision

Our immediate goal is to participate in the Ethereum AI Agent Hackathon and showcase a working prototype. Post-hackathon, we aim to:

- Simplify the interface for broader adoption by local communities.

- Expand the system to other regions in Asia.

- Collaborate with large funding organizations (e.g., government entities, venture capital) to create evergreen funding pools that use agent-driven coordination to improve resource allocation.

By integrating decentralized, transparent funding mechanisms with AI, we believe this project can significantly enhance collaboration and sustainability within DAOs and other community-driven initiatives.

### Glossary

- **Deep Rewarding**: A mechanism designed to ensure fair and transparent reward distribution within decentralized communities.

- **Decentralized Communities**: Groups where decision-making and reward distribution are managed collectively without a central authority.

- **Fair Reward Distribution**: Equitable allocation of rewards among contributors based on their contributions.

- **Assist Credits (ERC1155)**: Tokens used to express appreciation and track collaboration among contributors.

- **Role Management (Hats Protocol)**: A protocol used to assign and formalize roles within the community.

- **AI Agent**: An artificial intelligence system that monitors interactions and suggests credit exchanges.

- **Telegram Bot**: A bot that reminds community members to send Assist Credits and recognize contributions.

- **Dependency Graph**: Visual representations of interdependencies within the community, generated by analyzing transaction data.

- **Transaction Data Analysis**: The process of examining credit transactions to identify key contributors.

- **Human Validation**: Community members' review of AI-generated dependency graphs to ensure accuracy.

- **Splits Protocol (Fund Distribution)**: A protocol for transparent and immutable on-chain fund distribution.

- **Blockchain & Smart Contracts**: Technologies used to record transactions and manage fund distribution transparently.

- **Gaia Network (AI Hosting)**: The platform hosting the AI model, providing an OpenAI-compatible API endpoint.

- **User Interface (Non-Technical Accessibility)**: A simple and intuitive UI designed for non-technical users.

- **Ethereum AI Agent Hackathon**: An event where the project aims to showcase a working prototype.

- **DAO (Decentralized Autonomous Organization)**: An organization governed by smart contracts and community consensus.

- **Local Community Support (Japan & Beyond)**: Expanding the project to support local communities in Japan and other regions.

- **Funding Allocation (Government, VC, Public Goods)**: Collaborating with funding organizations to create sustainable funding pools.

- **Automation & Transparency**: Using AI and blockchain to automate processes and ensure transparency.

- **Sustainability & Collaboration**: Enhancing collaboration and sustainability within DAOs and community-driven initiatives.
