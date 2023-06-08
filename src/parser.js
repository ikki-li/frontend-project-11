export default (response, data) => {
  const existingFeedsCount = data.feeds.length;
  const existingPostsCount = data.posts.length;
  const result = {
    feed: {},
    posts: [],
  };
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('resource contains invalid rss');
  }
  const titleEl = doc.querySelector('channel > title');
  result.feed.name = titleEl.textContent;
  const descriptionEl = doc.querySelector('channel > description');
  result.feed.description = descriptionEl.textContent;
  const feedId = existingFeedsCount + 1;
  result.feed.id = feedId;
  const itemsEl = doc.querySelectorAll('item');
  itemsEl.forEach((itemEl, index) => {
    const post = {};
    const titleItemEl = itemEl.querySelector('title');
    post.name = titleItemEl.textContent;
    const descriptionItemEl = itemEl.querySelector('description');
    post.description = descriptionItemEl.textContent;
    const linkItemEl = itemEl.querySelector('link');
    post.link = linkItemEl.textContent;
    post.feedtId = feedId;
    post.id = existingPostsCount + index + 1;
    result.posts.push(post);
  });
  return result;
};
