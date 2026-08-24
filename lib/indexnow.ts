export async function notifyIndexNow(url: string) {
  const host = 'www.webnovelreader.com';
  const key = '84552e3af88c4263aa6a'; // Your actual API key

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: host,
        key: key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: [url],
      }),
    });

    if (response.ok) {
      console.log('IndexNow successfully notified for:', url);
    } else {
      console.error('Failed to notify IndexNow:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending IndexNow notification:', error);
  }
}