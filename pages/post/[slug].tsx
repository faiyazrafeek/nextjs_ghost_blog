import Link from 'next/link'
import {useRouter} from 'next/router'
import { useState } from 'react'
import styles from '../../styles/Home.module.css'

const {BLOG_URL, CONTENT_API_KEY} = process.env

async function getPost (slug: string) {
    const res = await fetch(
        `${BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}?key=${CONTENT_API_KEY}&fields=title,slug,html,feature_image`)
      .then((res) => res.json())
    
      const posts = res.posts
    
    return posts[0]
}

export const getStaticProps = async ({ params }) => {
    const post = await getPost(params.slug)
      return {
        props: {post},
        revalidate: Number(1)
      }
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: true
    }
}

type Post = {
    title: string
    slug: string
    html: string
  }

const Post: React.FC<{post: Post}> = (props) => {
    console.log(props);

    const {post} = props
    const [enableLoadComments, setEnableLoadComments] = useState<boolean>(true)

    const router = useRouter()

    if (router.isFallback){
        return <h1>Loading...</h1>
    }

    function loadComments(){
        setEnableLoadComments(false)
        //going to load discuss
        ;(window as any).disqus_config = function () {
            this.page.url = BLOG_URL; 
            this.page.identifier = post.slug; 
        }

        const script = document.createElement('script')
        script.src = 'https://techviral-blog.disqus.com/embed.js'
        script.setAttribute('data-timestamp', Date.now().toString())
        
        document.body.appendChild(script)
    }

    return (
        <div>
            <div className={styles.postHeader}> 
                <div className={styles.goBack}>
                    <Link href="/">
                        <a>Go Back</a>
                    </Link>
                </div>
                <h1>{post.title}</h1>
            </div>
            <div>
                <div className={styles.htmlPost} dangerouslySetInnerHTML={{__html: post.html}}></div>
            </div>     

            {
                enableLoadComments && (
                    <a className={styles.commentBtn} onClick={loadComments} > Load Comments </a>
                )
            }
     
            <div className={styles.comment} id="disqus_thread"></div>
        </div>
    )
}

export default Post
