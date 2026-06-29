3.1
One of the best benchmarks in my personal view https://github.com/sierra-research/tau2-bench

5.1
If no one has ever explained it to you, to measure latency you can download the app https://www.audacityteam.org/, assuming you have duplex audio recordings. You will see each speaker stream and can identify the latency gaps.

For those who don't know, Time to First Token (TTFT) is the most important measure. Because we stream content, the time it takes to get the first token is the actual gap in latency.

Streaming means instead of getting the whole reply in one go, we get the first word, then the second word, etc. So TTFT is basically the time to the first word we get back that the user can hear.

5.4.1
STT is still one of the areas I see voice AI agents fail the most. Typically, companies measure the quality of their STT in Word Error Rate (WER), most claiming they only get around 6–8% of words wrong.

This WER rises sharply for non-English languages, especially around certain categories of words. General WER is useless if your voice agent is designed to book appointments but the STT can't capture dates or times. This is why I think we need to move to reporting performance on certain classes of words.

5.4.2
Tuning your system prompt well so it knows it's a voice agent is important.

5.6.2
Krisp and https://ai-coustics.com/ are two of the most commonly known companies offering voice isolation and background noise cancellation services.

5.7.4
This is the first job I've worked in where deploying servers close to your customers is actually important.

5.9
Also known as barge-in.

6.3.
The biggest issue here is latency. Are you waiting for the model to reply before you can reply to the user? At the moment, we're seeing the industry follow two paths:
Guardrails can either be blocking or non-blocking.
Blocking guardrails run before the user's speech is replied to, so they are the safest but add latency.
Non-blocking guardrails run in parallel.
There is some interesting research in this area https://www.youtube.com/watch?v=d-nTIOFoIl8


7
Determinism is definitely an increasingly secret killer of voice AI.

Prior to LLMs, voice AI was typically managed using natural language understanding, which was incredibly clunky. LLMs have allowed us to create genuinely good quality conversations. These are great in a demo, and everyone raised a lot of money on it.

For some use cases, this works fine—examples being typical FAQs for companies or IVR replacements. The problem is when a customer or a business needs something that is consistent. For example, you should never offer a customer a refund on an airline ticket unless it meets the policy requirements.

The problem with LLMs is they are non-deterministic, so you can never guarantee to a customer that the agent will follow the rules 100% of the time. One approach is using guardrails, but this gets particularly clunky, especially when customers have 50- or 60-step workflows that must be followed consistently.

I expect a future area of research to be how to manage determinism with LLMs, where we give control over certain parts of the conversation to LLMs and certain parts to deterministic processes. I think this is probably one of the biggest markers of voice AI being used at a genuinely enterprise level, as most enterprise customers with complex use cases need this.

8.3
Hamming.ai is another one.

9
SIP and telephony has to be the funniest part of voice AI. The experts in SIP are wizardly older men who have spent the last 30 years living in a dark room at the back of British Telecom keeping the phone systems for London alive as a thankless job. They are now having to deal with 19-year-old Silicon Valley teenagers wearing OpenAI swag who have never had to send an SMS in their life.

On a serious note, 80% of issues in production voice AI trace back to telephony networks. They are the one part of your system that you have no control over. You may find that your voice agent simply cannot call Pakistan because the local Pakistani carrier uses a different codec than yours.

PSTN cannot carry additional data, so you'll have to find creative ways using SIP or APIs to pass contextual data back and forth.
10
I would argue here that RAG and memory are two different things. Typically what I see in production:

RAG, which is an external knowledge base, is used by customers to load in data that may or may not be needed for the purpose of a conversation. These could be things like help manuals, opening times, things that the agent may or may not need, which you don't want to put in the prompt because they'll overload the context. These databases can be 10,000+ pages.

Memory, which is a newer concept, means that if a customer calls in today and calls again the next day, the agent will remember what was said on the first day. Typically, RAG isn't needed here because when you start the conversation, you definitely want to load in the memory, not optionally. What is typically done at the moment is you save and summarize the previous calls and load them as dynamic content at the start of the call, appending it to the prompt. There are definitely going to be issues long-term here with context overload, and I expect it to be a future area of research.
