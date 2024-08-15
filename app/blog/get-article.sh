if [ -d "src/content/post" ]; then
  cd src/content/post
  git pull
  cd ../../..
else
  echo cloning using $ARTICLE_PAT
  git clone "https://$ARTICLE_PAT@github.com/yy4382/blog-posts.git" --depth 1 --branch main --single-branch --quiet src/content/post
fi
