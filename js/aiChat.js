// ИИ Чат
class AIChat {
    constructor() {
        this.conversationHistory = [];
    }

    async sendMessage(message) {
        const hasCrisis = this.detectCrisis(message);
        
        // ДЕБАГ
        console.log('==================');
        console.log('🔍 Провайдер:', AI_CONFIG.provider);
        console.log('🔑 Groq ключ:', AI_CONFIG.apiKeys.groq?.substring(0, 10) + '...');
        console.log('📝 Сообщение:', message);
        console.log('==================');
        
        try {
            let response;
            
            // ВАЖНО: проверяем провайдера СТРОГО
            const provider = AI_CONFIG.provider.toLowerCase().trim();
            
            if (provider === 'groq') {
                console.log('✅ Вызываем Groq API...');
                response = await this.getGroqResponse(message, hasCrisis);
            } else if (provider === 'claude') {
                console.log('✅ Вызываем Claude API...');
                response = await this.getClaudeResponse(message, hasCrisis);
            } else if (provider === 'openai') {
                console.log('✅ Вызываем OpenAI API...');
                response = await this.getOpenAIResponse(message, hasCrisis);
            } else {
                console.log('⚠️ Используем DEMO (провайдер:', provider, ')');
                response = await this.getDemoResponse(message, hasCrisis);
            }
            
            console.log('📨 Ответ получен:', response.substring(0, 50) + '...');
            
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );
            
            return { response, hasCrisis };
            
        } catch (error) {
            console.error('❌ Ошибка AI:', error);
            console.log('🔄 Fallback на DEMO');
            const response = await this.getDemoResponse(message, hasCrisis);
            return { response, hasCrisis };
        }
    }

    detectCrisis(message) {
        const lowerMessage = message.toLowerCase();
        return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
    }

    async getDemoResponse(message, hasCrisis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (hasCrisis) {
            return 'Слушай, я вижу, что тебе сейчас очень тяжело, и это серьезно. Пожалуйста, позвони прямо сейчас на телефон доверия 8-800-2000-122 - там люди, которые могут помочь именно в такие моменты. Или набери 112. Ты не один, и то, что ты чувствуешь, можно пережить с помощью. Есть кто-то рядом, с кем ты можешь сейчас быть?';
        }
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('грустно') || lowerMessage.includes('плохо') || lowerMessage.includes('подавлен')) {
            const responses = [
                'Мне правда жаль, что тебе так тяжело сейчас 😔 Как давно ты так себя чувствуешь?',
                'Это звучит действительно непросто... Что-то конкретное произошло, или это накопилось?',
                'Слушай, спасибо, что делишься этим. Ты с кем-нибудь об этом говорил?',
                'Понимаю, что сейчас очень тяжело. А есть моменты, когда тебе становится хоть чуть-чуть легче?'
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        if (lowerMessage.includes('тревога') || lowerMessage.includes('переживаю') || lowerMessage.includes('волнуюсь')) {
            const responses = [
                'Тревога - это действительно выматывает 😟 Из-за чего конкретно больше всего переживаешь?',
                'Понимаю, это состояние очень неприятное. Ты пробовал какие-то техники, чтобы успокоиться?',
                'Звучит напряженно... Это постоянно или бывают моменты, когда спокойнее?',
                'Что обычно вызывает эту тревогу сильнее всего?'
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        const generalResponses = [
            'Понимаю... А как ты обычно справляешься, когда тебе тяжело?',
            'Слушаю тебя. Что больше всего сейчас беспокоит?',
            'Спасибо, что делишься. Как давно это продолжается?',
            'Что обычно помогает тебе чувствовать себя лучше?',
            'Это правда звучит непросто. Ты пробовал с кем-то об этом поговорить?',
            'Я тут, слушаю. Что ещё хочешь рассказать?'
        ];
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    async getGroqResponse(message, hasCrisis) {
        const systemPrompt = AI_CONFIG.systemPrompt + 
            (hasCrisis ? '\n\n⚠️ КРИТИЧНО: Человек упомянул суицидальные мысли! Настоятельно рекомендуй срочно обратиться к специалистам и дай контакты экстренной помощи.' : '');

        console.log('🌐 Отправляем запрос к Groq...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKeys.groq}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.models.groq,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...this.conversationHistory,
                    { role: 'user', content: message }
                ],
                max_tokens: 300,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        console.log('📡 Статус ответа:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Groq API error:', errorData);
            throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('✅ Groq ответил:', data);
        return data.choices[0].message.content;
    }

    async getClaudeResponse(message, hasCrisis) {
        const systemPrompt = AI_CONFIG.systemPrompt + 
            (hasCrisis ? '\n\n⚠️ КРИТИЧНО: Человек упомянул суицидальные мысли! Настоятельно рекомендуй срочно обратиться к специалистам.' : '');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AI_CONFIG.apiKeys.claude,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: AI_CONFIG.models.claude,
                max_tokens: 300,
                system: systemPrompt,
                messages: [
                    ...this.conversationHistory,
                    { role: 'user', content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async getOpenAIResponse(message, hasCrisis) {
        const systemPrompt = AI_CONFIG.systemPrompt + 
            (hasCrisis ? ' КРИТИЧНО: Человек упомянул суицидальные мысли - рекомендуй срочную помощь!' : '');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKeys.openai}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.models.openai,
                max_tokens: 300,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...this.conversationHistory,
                    { role: 'user', content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async getVoiceAnalysisInsight(features, emotionalState) {
        if (AI_CONFIG.provider === 'demo') return null;
        
        try {
            const prompt = `На основе анализа голоса определено: ${emotionalState.title}.

Характеристики:
- Энергия: ${features.energyLevel}
- Высота: ${features.pitchLevel}
- Темп: ${features.tempoLevel}
- Длительность: ${features.duration.toFixed(1)} сек

Дай краткий (2-3 предложения) эмпатичный комментарий и один совет.`;

            if (AI_CONFIG.provider === 'groq') {
                return await this.getGroqResponse(prompt, false);
            } else if (AI_CONFIG.provider === 'claude') {
                return await this.getClaudeResponse(prompt, false);
            } else if (AI_CONFIG.provider === 'openai') {
                return await this.getOpenAIResponse(prompt, false);
            }
        } catch (error) {
            console.error('Ошибка AI анализа:', error);
            return null;
        }
    }
}