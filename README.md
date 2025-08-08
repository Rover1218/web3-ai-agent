# Web3 AI Agent with LangChain Integration

A sophisticated AI-powered cryptocurrency research assistant that intelligently analyzes user queries and fetches relevant data from multiple sources using LangChain and Groq AI.

## 🚀 Features

### 🤖 Intelligent AI Analysis
- **LangChain Integration**: Advanced AI chains that analyze user queries and determine which APIs to call
- **Groq AI**: Fast, reliable AI processing with multiple model fallbacks
- **Conversation Memory**: Maintains context across multiple queries
- **Structured Output**: Consistent, well-formatted responses with insights and risk analysis

### 📊 Multi-Source Data Integration
- **CoinMarketCap/CoinGecko**: Real-time cryptocurrency prices, market caps, and trading volumes
- **DeFiLlama**: DeFi protocol TVL, rankings, and performance metrics
- **Etherscan**: Blockchain data including gas prices, token information, and transactions
- **Dune Analytics**: Custom blockchain analytics and metrics

### 🎨 Modern UI/UX
- **Retro Professional Theme**: Clean, modern interface with professional styling
- **Real-time Updates**: Live data fetching and analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Elements**: Smooth animations and hover effects

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web3-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
   DUNE_API_KEY=your_dune_api_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 How LangChain Works

### Intelligent Query Analysis
The system uses LangChain to analyze user queries and determine which data sources are needed:

```typescript
// Example: User asks "What's the price of Bitcoin and show me DeFi protocols"
const apiRequirements = await apiAnalysisChain.invoke({ query });
// Returns: {
//   needsCryptoData: true,
//   cryptoSymbols: ['BTC'],
//   needsDeFiData: true,
//   needsEtherscanData: false,
//   priority: 'high'
// }
```

### Automatic Data Fetching
Based on the analysis, the system automatically fetches relevant data:

```typescript
// Fetches only the data that's needed
const data = await fetchRequiredData(apiRequirements);
// Only calls APIs that are relevant to the query
```

### Enhanced Analysis
LangChain provides structured analysis with insights, risk factors, and market trends:

```typescript
const result = await researchChain.invoke({ query, data });
// Returns comprehensive analysis with:
// - Summary
// - Key insights
// - Risk factors
// - Market trends
// - Data table (if applicable)
```

## 📝 Usage Examples

### Basic Queries
- "What's the current price of Bitcoin?"
- "Show me the top 5 DeFi protocols by TVL"
- "What's the current Ethereum gas price?"

### Advanced Analysis
- "Compare Bitcoin and Ethereum performance and analyze market trends"
- "Which DeFi protocols are trending this week and what are the risks?"
- "Analyze the correlation between TVL growth and social sentiment"

### Blockchain Queries
- "Show me recent Ethereum transactions"
- "What's the token information for USDT?"
- "Analyze gas price trends and their impact on DeFi usage"

## 🏗️ Architecture

### Core Components

1. **LangChain Integration** (`lib/langchain.ts`)
   - Query analysis chains
   - Data fetching orchestration
   - Structured output parsing

2. **API Layer** (`lib/api.ts`)
   - Multi-source data fetching
   - Error handling and fallbacks
   - Rate limiting management

3. **UI Components**
   - `QueryInput`: User input with mode selection
   - `ResearchResults`: Enhanced results display
   - `DataTable`: Structured data presentation

4. **API Routes**
   - `/api/analyze-langchain`: Main LangChain analysis endpoint
   - `/api/test-langchain`: Testing endpoint
   - Conversation management endpoints

### Data Flow

```
User Query → LangChain Analysis → API Requirements → Data Fetching → AI Analysis → Structured Response
```

## 🔍 Testing

### Test LangChain Integration
```bash
# Visit the test endpoint
curl http://localhost:3000/api/test-langchain
```

### Test Different Query Types
1. **Crypto Price Queries**: "What's the price of Bitcoin?"
2. **DeFi Analysis**: "Show me top DeFi protocols"
3. **Blockchain Data**: "What's the current gas price?"
4. **Complex Analysis**: "Compare top 5 cryptocurrencies and analyze trends"

## 🎯 Key Benefits

### For Users
- **Intelligent Responses**: AI determines what data is relevant
- **Comprehensive Analysis**: Multiple data sources in one query
- **Actionable Insights**: Risk factors and recommendations included
- **Conversation Context**: Remembers previous queries

### For Developers
- **Modular Architecture**: Easy to add new data sources
- **Type Safety**: Full TypeScript support
- **Error Handling**: Robust fallback mechanisms
- **Scalable**: Built for production use

## 🔧 Configuration

### Environment Variables
- `GROQ_API_KEY`: Required for AI analysis
- `COINMARKETCAP_API_KEY`: For market data (optional, falls back to CoinGecko)
- `DUNE_API_KEY`: For Dune Analytics queries
- `ETHERSCAN_API_KEY`: For blockchain data

### LangChain Configuration
- **Model**: Uses Groq's `llama-3.3-70b-versatile` with fallbacks
- **Temperature**: Set to 0.1 for consistent, focused responses
- **Memory**: Maintains conversation context for up to 10 messages

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Similar to Vercel deployment
- **Railway**: Good for full-stack applications
- **AWS/GCP**: For enterprise deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the code comments for detailed explanations

## 🔮 Future Enhancements

- [ ] Add more data sources (Glassnode, Messari, etc.)
- [ ] Implement advanced charting and visualization
- [ ] Add portfolio tracking capabilities
- [ ] Integrate with more blockchain networks
- [ ] Add sentiment analysis from social media
- [ ] Implement real-time notifications
- [ ] Add export functionality for reports
