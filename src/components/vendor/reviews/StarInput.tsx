import { Star } from "lucide-react";

export default function StarInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                        value >= star
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                    }`}
                    onClick={() => onChange(star)}
                />
            ))}
        </div>
    );
}
