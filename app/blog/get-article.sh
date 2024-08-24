# Function: find_file_directory
# Description: Search for the directory containing the specified file,
#   starting from the current directory and moving upwards.
# Parameters: $1 - The file name to search for.
# Returns: 0 - If the directory is found. 1 - If the directory is not found.
find_file_directory() {
  # 检查是否提供了文件名参数
  if [ $# -eq 0 ]; then
    echo "错误: 请提供要搜索的文件名" >&2
    return 1
  fi

  local file_name="$1"

  local current_dir=$(pwd)

  while [ "$current_dir" != "/" ]; do
    if [ -e "$current_dir/$file_name" ]; then
      echo "$current_dir"
      return 0
    fi

    current_dir=$(dirname "$current_dir")
  done

  echo "Error: Dirctory not found" >&2
  return 1
}

PACKAGE_ROOT=$(find_file_directory "astro.config.ts")

cd $PACKAGE_ROOT

if [ -d "src/content/post" ]; then
  cd src/content/post
  git pull
  cd ../../..
else
  git clone "https://$ARTICLE_PAT@github.com/yy4382/blog-posts.git" --depth 1 --branch main --single-branch --quiet src/content/post
fi
