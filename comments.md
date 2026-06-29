3.1 
One of the best benchmark in my personal view https://github.com/sierra-research/tau2-bench

5.1
If no one ever explained it, to measure this you can download the app https://www.audacityteam.org/, assuming you have duplex audio. You will see each speaker stream and see the latency gaps 

For those who don’t know, Time to first token (TTFT) is the most important measure, Because we stream content, the time it takes to get the first token is the actually gap in latency 

Streaming means; instead of getting the whole reply in one go, we get the first word, than the second word etc etc 

5.4.1
STT is still one of the areas I see voice ai agent fail the most. Typically companies will measure the quality of their STT in word error rate (WER), most claiming they only get around 6-8% of words wrong. 

This WER rises sharply for non-english languages, to the point it typically can’t understand most things in non-english 

5.4.2
Tuning your system prompt well to know it’s a voice agent is important 

5.6.2
Krisp and https://ai-coustics.com/ are two of the most commonly know companies offering voice isolation and background noise canceling services

5.7.4
This is the first job I've worked in where deploying servers close to your customers is actually important.

5.9 
Is also known as  barge in 

6.3.
The biggest issue here is latency. Are you waiting for the model to reply before you can reply to the user? At the moment, we're seeing the industry follow two paths:
Guard rails can either be blocking or non-blocking.
Blocking guard rails run before the user's speech is replied to, so they are the safest but add latency.
Non-blocking guard rails run in parallel.
Thre is some interesting research in this area https://www.youtube.com/watch?v=d-nTIOFoIl8

6.5 
Super interesting 

Transfer me to a human as an example 

7 
Determinism Is definitely an increasingly secret killer of voice AI. Prior to LLMsVoice and I was typically managed using natural language understanding.Which was incredibly clunkyLLM has allowed us to make what were genuinely good quality conversations.These are great in a demo, and everyone raised a lot of money on it.For some use cases, this works fine. Examples being typical FAQs for companies or IVR replacements. The problem is when a customer or a business needs something that is consistent. For example, you should never offer a customer a refund on an airline ticket unless it meets the policy requirements. The problem with LLMs is they are non-deterministic, so you can never guarantee a customer that this will follow 100%.One approach is using guard rails, but this gets particularly clunky, especially when customers have 50- or 60-step workflows that must be followed consistently.I expect a future area of research to be how to manage determinism with LLMs, where we give control over certain parts of the conversation to LLMs and certain parts to deterministic processes. I think this is probably one of the biggest markers of voice AI being used at a genuinely enterprise level, as most enterprise customers with complex use cases need this.

8.3 Hamming.ai is another one 

9 
Sip and telephony has to be the funniest part of the voice AI. The experts in SIP are wizard older men who have spent the last 30 years living in a dark room at the back of British Telecom keeping the phone systems for london alive as a thanklist job. They are Now having to deal with 19-year-old Silicon Valley teenagers wearing open AI swag who have never had to send an SMS in their life. 

On a serious note80% of issues in production of voice AI trace back to telephony networks. They are the one part of your system that you have no control over.You may find that your voice agent simply cannot call Pakistan because the local Pakistan carrier uses a different codex than yours.

PSTN cannot carry additional data, so you'll have to find interesting ways using SIP or APIs to pass contextual data to customers back and forth.
10 
I would argue here that RAG and memory are two different things. Typically what I see in production are
RAG, which is an external knowledge base, is used by customers to load in data that may or may not be needed for the purpose of a conversation.These could be things like help manuals, opening times, things that the agent may or may not need, which you don't want to put in the prompt because they'll overload the context. These databases can be 10,000 pages plus.
Memory, which is a newer concept, is that if a customer calls in today and calls in the next day, they will remember what was said on the first day. Typically, RCA isn't needed here because when you start the conversation, you definitely want to load in the memory, not optionally. What is typically done at the moment is you save and summarize the previous calls and load in any new calls as dynamic content at the start of the call, appending it to the prompt.There are definitely going to be issues long term here with context overload, and I expect it to be a future area of research.
