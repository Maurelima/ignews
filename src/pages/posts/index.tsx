import { GetStaticProps } from 'next'
import Head from 'next/head'
import { client } from '../../services/prismic'
import styles from './styles.module.scss'

import * as prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import Link from 'next/link'

type Post = {
    slug: string;
    title: string;
    exerpt: string;
    updatedAt: string;
}

interface PostProps {
    posts: Post[]
}

export default function Posts({ posts }: PostProps) {
    return (
        <>
            <Head>
                <title>Posts |  Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        <Link href={`/posts/${post.slug}`}  key={post.slug}>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.exerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {

    const response = await client.get(
        {
            predicates: prismic.predicate.at('document.type', 'post'),
            fetch: ['publication.title', 'publication.content'],
            pageSize: 100,
        }
    )

    const posts = response.results.map((post) => {
        const tmpContent = JSON.stringify(post.data.content)
        const jsonContent = JSON.parse(tmpContent)
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            exerpt: jsonContent.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
        }
    })

    return {
        props: {
            posts,
        }
    }
}