export default (data) => {
  const result = {
    feed: {},
    posts: [],
  };
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('resource contains invalid rss');
  }
  result.feed = {
    name: doc.querySelector('channel > title').textContent,
    description: doc.querySelector('channel > description').textContent,
    link: doc.querySelector('channel > link').textContent,
  };
  const itemsEl = doc.querySelectorAll('item');
  itemsEl.forEach((itemEl) => result.posts.push({
    name: itemEl.querySelector('title').textContent,
    description: itemEl.querySelector('description').textContent,
    link: itemEl.querySelector('link').textContent,
  }));
  return result;
};
