// Pixiv API路由 - 访问路径: example.com/api/pixiv
export async function onRequestPost(context) {
  try {
    const requestBody = await context.request.json();
    
    // 调用 Pixiv API
    const response = await fetch("https://api.lolicon.app/setu/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log('Pixiv API response:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error("Pixiv API error:", error.message);
    
    return new Response(JSON.stringify({
      error: "获取 Pixiv 图片失败",
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

// 处理OPTIONS预检请求
export function onRequestOptions(context) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// 处理GET请求（可选，用于API文档说明）
export function onRequestGet(context) {
  return new Response(JSON.stringify({
    message: "Pixiv API接口",
    method: "POST",
    description: "获取Pixiv图片数据",
    parameters: {
      r18: "number - 是否包含R18内容",
      num: "number - 返回图片数量",
      keyword: "string - 搜索关键词",
      tag: "array - 标签数组"
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
