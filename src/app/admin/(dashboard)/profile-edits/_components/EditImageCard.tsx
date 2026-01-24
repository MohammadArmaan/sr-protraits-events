import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import Zoom from "react-medium-image-zoom";


export default function EditImageCard({
    title,
    src,
    highlight,
    isOriginal,
}: {
    title: string;
    src: string | null;
    highlight?: boolean;
    isOriginal?: boolean;
}) {
    return (
        <Card
            className={`overflow-hidden transition-all hover:shadow-xl ${
                highlight
                    ? "border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent"
                    : "border-2 border-muted/50"
            }`}
        >
            <CardHeader className={`pb-3 ${highlight ? "bg-primary/10" : "bg-muted/20"}`}>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {highlight && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse ring-4 ring-primary/20"></div>
                    )}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative group">
                    {src ? (
                        <Zoom>
                            <img
                                src={src}
                                alt={title}
                                className="w-full aspect-square object-cover"
                            />
                        </Zoom>
                    ) : (
                        <div className="w-full aspect-square bg-muted/50 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <User className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground font-medium">
                                    {isOriginal ? "No Previous Photo" : "No Photo"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}