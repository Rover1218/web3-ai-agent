# Crypto Research Assistant

An AI-powered research assistant for crypto analysts that takes natural-language queries and fetches real-time data from multiple major platforms including Dune Analytics, DeFiLlama, and CoinMarketCap.

## Features

- 🤖 **AI-Powered Analysis**: Uses Groq API for intelligent data analysis and insights
- 📊 **Multi-Source Data**: Fetches data from CoinMarketCap, DeFiLlama, and Dune Analytics
- 🔍 **Natural Language Queries**: Ask complex questions in plain English
- 📈 **Real-Time Metrics**: Track TVL, price movements, social sentiment, and news events
- 🎯 **Compound Analysis**: Answer complex questions combining multiple data sources
- 📋 **Data Tables**: Present key metrics in organized, sortable tables
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Example Queries

The assistant can handle complex queries like:

- "Identify DeFi projects with the highest surge in TVL last week and summarize any major social sentiment shifts or news events affecting them. Present key metrics in a data table, and cite all source platforms used."
- "Compare the performance of top 5 DeFi protocols and analyze their market sentiment trends."
- "What are the emerging trends in the crypto market based on recent price movements and social sentiment?"
- "Analyze the correlation between TVL growth and social sentiment for major DeFi protocols."

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq API (Llama 3.1 8B model)
- **Data Sources**: 
  - CoinMarketCap API
  - DeFiLlama API
  - Dune Analytics API
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for:
  - [Groq](https://console.groq.com/) (for AI analysis)
  - [CoinMarketCap](https://coinmarketcap.com/api/) (for crypto market data)
  - [Dune Analytics](https://dune.com/docs/api/) (for blockchain analytics)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-research-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GROQ_API_KEY=your-groq-api-key-here
   COINMARKETCAP_API_KEY=your-coinmarketcap-api-key-here
   DUNE_API_KEY=your-dune-api-key-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### POST `/api/research`
Submit a research query for analysis.

**Request Body:**
```json
{
  "query": "Your research question here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "AI-generated analysis summary",
    "dataTable": [...],
    "sources": ["CoinMarketCap", "DeFiLlama", "Dune Analytics"],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── research/      # Research endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── QueryInput.tsx     # Query input form
│   ├── DataTable.tsx      # Data table display
│   └── ResearchResults.tsx # Results display
├── lib/                   # Utility libraries
│   ├── api.ts            # API service functions
│   ├── groq.ts           # Groq AI integration
│   └── types.ts          # TypeScript definitions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Data Sources

### CoinMarketCap
- Real-time cryptocurrency prices
- Market cap and volume data
- Price change percentages

### DeFiLlama
- Total Value Locked (TVL) data
- DeFi protocol rankings
- Chain-specific metrics

### Dune Analytics
- Blockchain analytics
- Custom SQL queries
- Historical data analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Disclaimer

This tool is for educational and research purposes. Always verify data independently and do not make financial decisions based solely on automated analysis.
