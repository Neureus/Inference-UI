# Inference UI Documentation

> **Complete documentation for integrating with Inference UI**

Welcome! This documentation will help you integrate Inference UI into your applications using MCP Server, Service Bindings, or HTTP API.

## 📚 Documentation Guide

### Getting Started

**New to Inference UI?** Start here:

1. **[Quick Start Guide](QUICK-START.md)** ⚡
   - Choose the right integration method
   - Get up and running in 5-10 minutes
   - Setup for MCP, Service Bindings, or HTTP API
   - Success checklists and next steps

### Integration Methods

Choose your integration approach:

#### 🤖 For AI Assistants (Natural Language)

**[MCP User Guide](MCP-USER-GUIDE.md)** - Model Context Protocol Server
- Natural language interface with Claude, Cline, etc.
- No coding required for basic queries
- Perfect for exploration and debugging
- AI-powered analytics and insights

**Best for**: Non-technical users, rapid prototyping, ad-hoc analysis

---

#### ⚡ For Cloudflare Workers (Production)

**[Service Bindings User Guide](SERVICE-BINDINGS-USER-GUIDE.md)**
- 0ms latency worker-to-worker communication
- 50% cost savings (service bindings are free)
- Type-safe TypeScript integration
- Production-ready performance

**Best for**: High-performance applications, cost-sensitive projects, Cloudflare Workers

---

#### 🌐 For Everything Else (Universal)

**HTTP API** (Coming soon: dedicated guide)
- Standard REST/GraphQL API
- Works from any platform
- Language-agnostic
- Maximum compatibility

**Best for**: Non-Cloudflare platforms, mobile apps, cross-account access

---

### Advanced Guides

**[Integration Examples](INTEGRATION-EXAMPLES.md)** 📊
- Complete real-world examples
- E-Commerce platform integration
- SaaS analytics dashboard
- Mobile app backend
- Multi-tenant applications
- Best practices and patterns

**[Multi-Tenant Architecture](MULTI-TENANT-GUIDE.md)** 🏢
- Tenant identification with service bindings
- Implementation patterns and wrappers
- Security and data isolation
- Complete SaaS examples

**[Service Bindings Authentication](SERVICE-BINDINGS-AUTHENTICATION.md)** 🔐
- Authentication flow without HTTP headers
- JWT, API keys, sessions, subdomains
- Two-layer security model
- Trust and responsibility boundaries

**[Troubleshooting Guide](TROUBLESHOOTING.md)** 🔧
- Common issues and solutions
- MCP server problems
- Service bindings errors
- Performance optimization
- Debugging tools and techniques

---

## 🚀 Quick Links

### By Use Case

| Use Case | Documentation | Time to Setup |
|----------|---------------|---------------|
| **AI Assistant Integration** | [MCP Guide](MCP-USER-GUIDE.md) | 5 minutes |
| **Production Worker App** | [Service Bindings Guide](SERVICE-BINDINGS-USER-GUIDE.md) | 10 minutes |
| **Cross-Platform App** | [HTTP API](#) | 2 minutes |
| **Learning & Exploration** | [Quick Start](QUICK-START.md) | Variable |

### By Role

| Role | Start Here | Why |
|------|-----------|-----|
| **Product Manager** | [MCP Guide](MCP-USER-GUIDE.md) | Natural language queries, no coding |
| **Frontend Developer** | [Quick Start](QUICK-START.md) → HTTP API | Universal compatibility |
| **Backend Developer** | [Service Bindings Guide](SERVICE-BINDINGS-USER-GUIDE.md) | Maximum performance |
| **DevOps Engineer** | [Troubleshooting](TROUBLESHOOTING.md) | Deployment and monitoring |
| **Data Analyst** | [MCP Guide](MCP-USER-GUIDE.md) | AI-powered analysis |

---

## 📖 Documentation Structure

```
docs/
├── README.md                          ← You are here
├── QUICK-START.md                     ← Start here for rapid setup
├── MCP-USER-GUIDE.md                  ← Complete MCP server guide
├── SERVICE-BINDINGS-USER-GUIDE.md     ← Service bindings reference
├── INTEGRATION-EXAMPLES.md            ← Real-world code examples
└── TROUBLESHOOTING.md                 ← Problem solving guide
```

---

## 🎯 Choose Your Path

### Path 1: Natural Language (MCP)

**Best for**: Quick exploration, ad-hoc queries, non-developers

```
1. Quick Start Guide → MCP Setup (5 min)
2. MCP User Guide → Using with AI Assistants
3. Try example queries
4. Explore with natural language
```

**Start**: [Quick Start - MCP Setup](QUICK-START.md#mcp-setup)

---

### Path 2: Production Integration (Service Bindings)

**Best for**: Cloudflare Workers applications, production systems

```
1. Quick Start Guide → Service Bindings Setup (10 min)
2. Service Bindings Guide → Configuration
3. Integration Examples → Your use case
4. Deploy and monitor
```

**Start**: [Quick Start - Service Bindings Setup](QUICK-START.md#service-bindings-setup)

---

### Path 3: Cross-Platform (HTTP API)

**Best for**: Non-Cloudflare platforms, mobile apps, universal access

```
1. Quick Start Guide → HTTP API Setup (2 min)
2. Test with curl/Postman
3. Integrate into your application
4. Deploy and scale
```

**Start**: [Quick Start - HTTP API Setup](QUICK-START.md#http-api-setup)

---

## 🆘 Need Help?

### Common Issues

- **MCP server not starting?** → [Troubleshooting - MCP Issues](TROUBLESHOOTING.md#mcp-server-issues)
- **Service binding undefined?** → [Troubleshooting - Service Bindings](TROUBLESHOOTING.md#service-bindings-issues)
- **Slow response times?** → [Troubleshooting - Performance](TROUBLESHOOTING.md#performance-issues)
- **Events not showing?** → [Troubleshooting - Data Quality](TROUBLESHOOTING.md#data-quality-issues)

### Get Support

- **📖 Documentation**: You're reading it!
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-org/inference-ui/issues)
- **💬 Community**: [Discord Server](https://discord.gg/inference-ui)
- **📧 Email**: support@inference-ui.com (Business/Enterprise)

---

## 📦 What's in Each Guide?

### Quick Start Guide
- **Length**: ~15 minutes read
- **Content**: Choose integration, 3 setup paths, common use cases
- **Format**: Step-by-step instructions with commands

### MCP User Guide
- **Length**: ~30 minutes read
- **Content**: MCP concepts, installation, configuration, usage examples
- **Format**: Comprehensive reference with natural language examples

### Service Bindings User Guide
- **Length**: ~40 minutes read
- **Content**: Architecture, configuration, all 7 methods, performance tips
- **Format**: Technical reference with code examples

### Integration Examples
- **Length**: ~1 hour read
- **Content**: Complete working examples for real-world scenarios
- **Format**: Full source code with explanations

### Troubleshooting Guide
- **Length**: Reference (as needed)
- **Content**: Solutions for common issues, debugging tools
- **Format**: Problem/solution pairs with commands

---

## 🎓 Learning Path

**Beginner** (Day 1):
1. Read [Quick Start Guide](QUICK-START.md)
2. Choose one integration method
3. Complete setup (5-10 minutes)
4. Test with examples

**Intermediate** (Week 1):
1. Read relevant user guide (MCP or Service Bindings)
2. Try all available methods/tools
3. Review [Integration Examples](INTEGRATION-EXAMPLES.md)
4. Build your first integration

**Advanced** (Month 1):
1. Optimize performance using guide tips
2. Implement multiple patterns from examples
3. Contribute improvements
4. Help others in community

---

## 🌟 Key Concepts

### MCP (Model Context Protocol)
A standard that lets AI assistants interact with external tools. Think of it as a universal API for AI.

### Service Bindings
Cloudflare's zero-latency, zero-cost worker-to-worker communication. Direct RPC calls instead of HTTP.

### Event Intelligence
Automatic event capture, AI enrichment, and analytics. Built into every component.

### GraphQL API
Query analytics data with flexible, type-safe queries. Returns exactly what you need.

### Workers AI
Cloudflare's edge AI inference. 180+ locations, <50ms latency, 180+ models.

---

## 📊 Feature Comparison

| Feature | MCP Server | Service Bindings | HTTP API |
|---------|------------|------------------|----------|
| **Latency** | 0ms (local) | 0ms (RPC) | 50-100ms |
| **Cost** | Free | Free | $0.50/M req |
| **Platform** | Any (via AI) | Cloudflare Workers | Universal |
| **Coding** | Not required | TypeScript/JS | Any language |
| **Type Safety** | N/A | Full | Depends |
| **Natural Language** | ✅ Yes | ❌ No | ❌ No |
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Streaming** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Batch Operations** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔗 External Resources

### Cloudflare Documentation
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [D1 Database](https://developers.cloudflare.com/d1/)

### MCP Documentation
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/download)

### GraphQL
- [GraphQL.org](https://graphql.org/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

---

## 📝 Contributing

Found an issue or have a suggestion for the documentation?

1. [Open an issue](https://github.com/your-org/inference-ui/issues/new)
2. Submit a pull request
3. Join the [Discord community](https://discord.gg/inference-ui)

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details

---

## 🎉 Ready to Start?

Choose your path and dive in:

- 🤖 **AI Assistant Users**: [MCP User Guide →](MCP-USER-GUIDE.md)
- ⚡ **Cloudflare Developers**: [Service Bindings Guide →](SERVICE-BINDINGS-USER-GUIDE.md)
- 🚀 **Everyone Else**: [Quick Start Guide →](QUICK-START.md)

**Questions?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or [ask the community](https://discord.gg/inference-ui).

---

**Built with ❤️ on Cloudflare Workers | Powered by Model Context Protocol**

*Last updated: 2025-01-17*
