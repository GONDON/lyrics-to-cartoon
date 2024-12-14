/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2024-12-13 14:36:25
 * @LastEditTime: 2024-12-14 16:06:00
 * @FilePath: /lyrics-to-cartoon/src/App.js
 * @Description: 
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [comicImages, setComicImages] = useState([]);
  const [isGeneratingComics, setIsGeneratingComics] = useState(false);

  // 使用 OpenAI API 提取文字
  const extractTextFromImage = async (base64Image) => {
    setIsProcessing(true);
    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "你是一个高精度的歌词OCR工具。你的唯一任务是从图片中提取歌词，完全按照原文输出每一行。不要添加、修改或优化任何内容。"
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `请严格按照以下要求提取歌词：
1. 每一行必须与原文完全一致
2. 保持原有的换行位置
3. 不要添加任何标点符号
4. 不要添加空格或缩进
5. 不要修正任何可能的错误
6. 不要优化任何格式
7. 不要添加任何��外字符
8. 按照图片中的��序逐行输出
9. 不要解释或注释
10. 如果看不清楚，就输出 [?]
`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
          temperature: 0,
          presence_penalty: 0,
          frequency_penalty: 0,
          top_p: 0.1,
          response_format: { type: "text" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('文字提取错误:', error);
      return '文字提取失败: ' + error.message;
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target.result;
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: base64Image,
            name: file.name
          }]);
          
          // 提取文字
          const text = await extractTextFromImage(base64Image);
          setExtractedText(prev => prev + (prev ? '\n\n' : '') + text);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    }
  });

  // 添加故事生成函数
  const generateStory = async () => {
    if (!extractedText || isGeneratingStory) return;
    
    setIsGeneratingStory(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages: [
            {
              role: "system",
              content: `你同时具备两个专业身份：

1. 你是一位才华横溢的小说家，擅长创作富有深度和人性洞察的文学作品。你的写作风格：
- 具有村上春树式的细腻情感描写和超现实主义元素
- 具备张爱玲般洞察人性、描绘命运的能力
- 拥有余华式直击人心的叙事手法
- 掌握卡夫卡式的深邃寓意和象征手法
- 融合马尔克斯的魔幻现实主义笔触

2. 你也是一位专业的语言学家：
- 精通语言结构和语言学研究
- 对句子中的词性有敏锐的识别能力
- 能准确分析每个词语的语法功能
- 深谙语言的韵律和节奏
- 擅长运用语言的音韵和节奏创造文学效果
- 能准确把握词语的细微差别和情感内涵

你需要运用这两种身份的专业能力，基于给定的歌词创作一个既有文学深度，又在语言运用上精准优美的故事。`
            },
            {
              role: "user",
              content: `请基于以下歌词创作一个富有文学性的故事，要求：

创作要求：
1. 将歌词的核心情感和主题升华为完整故事
2. 创造立体的人物形象，展现内心复杂性
3. 通过细腻的环境描写烘托氛围
4. 运用优美而精准的语言，注重词性搭配
5. 故事要有深层的人性思考和情感共鸣
6. 巧妙设置情节转折，构建完整故事弧线
7. 将歌词意境融入叙事，而非直接引用
8. 通过细节描写展现人物心理变化
9. 注重语言的韵律感和节奏美
10. 精心选择每个词语，确保语言的准确性和优美性

语言运用要求：
- 准确把握词语的感情色彩
- 注意动词的力度和形容词的层次
- 合理使用修辞手法增强表现力
- 注重句式变化和语言节奏
- 善用意象和象征手法
- 保持语言的优美性和可读性

歌词内容：
${extractedText}

请创作一个在文学价值和语言艺术上都十分出色的故事。`
            }
          ],
          max_tokens: 2000,
          temperature: 0.8,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
          top_p: 0.95
        })
      });

      if (!response.ok) {
        throw new Error('故事生成失败');
      }

      const data = await response.json();
      setGeneratedStory(data.choices[0].message.content);
    } catch (error) {
      console.error('故事生成错误:', error);
      setGeneratedStory('故事生成失败: ' + error.message);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // 添加生成漫画的函数
  const generateComics = async () => {
    if (!generatedStory || isGeneratingComics) return;
    
    setIsGeneratingComics(true);
    try {
      // 首先生成4个场景描述
      const scenesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages: [
            {
              role: "system",
              content: "你是一位专业的日本漫画分镜师，擅长将故事转化为富有感染力的关键场景。你需要确保场景描述符合日式漫画的视觉特点和叙事风格，特别注重情感表达和氛围营造。"
            },
            {
              role: "user",
              content: `请基于以下故事，创作4个关键场景的描述，用于生成日式黑白漫画。要求：
1. 场景要符合日本漫画的构图美学
2. 人物形象要保持日系角色特征的一致性
3. 场景之间要有流畅的叙事连贯性
4. 注重细腻的情感表达和氛围营造
5. 强调光影的诗意表现
6. 每个场景都要体现故事的情感深度

请将故事分为四个关键场景：
- 第一场景：故事的开端和背景设定
- 第二场景：情节发展和冲突引入
- 第三场景：故事的高潮或转折点
- 第四场景：情感升华和故事结局

故事内容：
${generatedStory}

请分别描述4个场景，每个场景用一段简短的文字描述。注意保持人物形象和风格的一致性。`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const scenesData = await scenesResponse.json();
      const scenes = scenesData.choices[0].message.content.split('\n\n');

      // 为每个场景生成图片
      const imagePromises = scenes.map(async (scene) => {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `Create a Japanese manga style black and white illustration of: ${scene}. 
Style requirements:
- Classic Japanese manga art style
- Clean black and white ink technique
- Soft gradients and screentone effects
- Elegant line work and flowing compositions
- Japanese anime/manga character features
- Expressive eyes and emotional faces
- Minimalist yet detailed backgrounds
- Dynamic panel layouts
- No text or speech bubbles
- Emphasis on emotional atmosphere
- Similar to works by Makoto Shinkai and Studio Ghibli
- Maintain consistent character designs
Additional notes:
- Use delicate line weights
- Include subtle emotional expressions
- Focus on mood and atmosphere
- Create depth through subtle shading
- Keep character designs consistent and anime-styled
- Incorporate symbolic visual elements
- Use speed lines and impact frames when appropriate`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "vivid"
          })
        });

        const data = await response.json();
        return data.data[0].url;
      });

      const newImages = await Promise.all(imagePromises);
      setComicImages(newImages);
    } catch (error) {
      console.error('漫画生成错误:', error);
    } finally {
      setIsGeneratingComics(false);
    }
  };

  return (
    <div className="App">
      <header className="cartoon-header">
        <h1 className="cartoon-title">
          <span className="title-word">Lyrics</span>
          <span className="title-separator">to</span>
          <span className="title-word">Cartoon</span>
        </h1>
      </header>
      
      <div className="main-container">
        <div className="upload-section">
          <div 
            {...getRootProps()} 
            className={`upload-container ${isDragActive ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="upload-area">
              <div className="upload-icon">{isProcessing ? '⏳' : '📸'}</div>
              <p>{isProcessing ? '正在提取文字...' : '拖拽图片到这里或者点击上传'}</p>
            </div>
          </div>
        </div>

        <div className="preview-section">
          {extractedText && (
            <div className="text-content">
              <div className="text-header">
                <h2>提取的文字</h2>
                <button 
                  className="generate-button"
                  onClick={generateStory}
                  disabled={isGeneratingStory}
                >
                  {isGeneratingStory ? '正在创作故事...' : '生成故事'}
                </button>
              </div>
              <pre className="extracted-text">{extractedText}</pre>
            </div>
          )}

          {generatedStory && (
            <div className="story-content">
              <div className="story-header">
                <h2>生成的故事</h2>
                <button 
                  className="generate-button"
                  onClick={generateComics}
                  disabled={isGeneratingComics}
                >
                  {isGeneratingComics ? '正在生成漫画...' : '生成漫画'}
                </button>
              </div>
              <div className="story-text">{generatedStory}</div>
            </div>
          )}

          {comicImages.length > 0 && (
            <div className="comics-content">
              <h2>故事漫画</h2>
              <div className="comics-grid">
                {comicImages.map((url, index) => (
                  <div key={index} className="comic-panel">
                    <img src={url} alt={`Scene ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 