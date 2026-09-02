import { NextRequest, NextResponse } from 'next/server';
import { getArticles, createArticle } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const articles = await getArticles(category);

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du chargement des articles.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Titre de l\'article requis.' }, { status: 400 });
    }

    const titleStr = typeof body.title === 'string' ? body.title : body.title.fr;
    const generatedSlug = titleStr
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newArticle = await createArticle({
      slug: body.slug || generatedSlug || `art-${Date.now()}`,
      title: typeof body.title === 'string' ? { fr: body.title, ar: body.title, en: body.title } : body.title,
      category: body.category || 'Architecture',
      excerpt: typeof body.excerpt === 'string' ? { fr: body.excerpt, ar: body.excerpt, en: body.excerpt } : body.excerpt,
      content: typeof body.content === 'string' ? { fr: body.content, ar: body.content, en: body.content } : body.content,
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
      readTime: body.readTime || '4 min',
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      author: body.author || 'Rédaction Villa Regia',
    });

    return NextResponse.json({ success: true, article: newArticle }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la publication de l\'article.' }, { status: 500 });
  }
}
