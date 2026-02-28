
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UrbeLudoLogo } from '@/components/UrbeLudoLogo';
import { ArrowLeft, Heart, MessageSquare, Share2, MapPin, User } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CommunityPage() {
  const db = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    return query(collection(db, 'public_gallery'), orderBy('startTime', 'desc'), limit(20));
  }, [db]);

  const { data: posts, isLoading } = useCollection(galleryQuery);

  const handleLike = (postId: string) => {
    const postRef = doc(db, 'public_gallery', postId);
    updateDoc(postRef, { likes: increment(1) });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col pb-24">
      <header className="px-6 h-16 flex items-center justify-between bg-background border-b sticky top-0 z-50">
        <Link href="/playground" className="p-2"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex items-center gap-2">
          <UrbeLudoLogo className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase italic tracking-tighter">Galeria Urbe</span>
        </div>
        <div className="w-9" />
      </header>

      <main className="p-4 space-y-6 container max-w-lg mx-auto">
        <div className="bg-primary/10 p-4 rounded-3xl border border-primary/20 text-center space-y-1">
          <h2 className="text-xs font-black uppercase text-primary">Inspiração Coletiva</h2>
          <p className="text-[10px] font-medium text-muted-foreground">Veja como outros exploradores estão ressignificando a cidade.</p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="grid gap-6">
            {posts?.map((post) => (
              <Card key={post.id} className="overflow-hidden border-none rounded-[2.5rem] shadow-sm bg-background">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 rounded-full bg-muted">
                      <AvatarImage src={`https://picsum.photos/seed/${post.userProgressId}/100`} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase italic leading-none">{post.userName}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <MapPin className="w-2 h-2" /> {post.missionType === 'street' ? 'Exploração Urbana' : 'Espaço Criativo'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-primary/10 text-primary border-none">{post.challengeTitle}</Badge>
                </div>
                
                {post.photoUrl && (
                  <div className="aspect-square relative bg-muted">
                    <img src={post.photoUrl} alt="Post" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">"{post.challengeDescription}"</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-4">
                      <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-[10px] font-black">{post.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px] font-black">0</span>
                      </button>
                    </div>
                    <button className="text-muted-foreground"><Share2 className="w-5 h-5" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-20 bg-background border-t flex items-center justify-around px-6 z-50">
         <Link href="/playground" className="flex flex-col items-center gap-1 text-muted-foreground"><MapPin className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Play</span></Link>
         <div className="flex flex-col items-center gap-1 text-primary"><Share2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Galeria</span></div>
         <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground"><User className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Perfil</span></Link>
      </footer>
    </div>
  );
}

function Loader2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2 animate-spin"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>;
}
