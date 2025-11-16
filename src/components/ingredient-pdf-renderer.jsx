// IngredientPdfRenderer.jsx
import React, { useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
const logo =
  'https://res.cloudinary.com/dee339rpr/image/upload/v1763079993/Recipedia-logo-square_fjv9ch.svg';

export function IngredientPdfRenderer({ title, author, ingredients, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const run = async () => {
      if (!ref.current) return;

      try {
        // Wait for fonts (optional, but helps text render correctly)
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }

        const dataUrl = await htmlToImage.toPng(ref.current, {
          cacheBust: true,
          backgroundColor: '#ffffff',
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4',
        });

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${title}-ingredients.pdf`);
      } catch (err) {
        console.error('Failed to export ingredients PDF:', err);
      } finally {
        onDone();
      }
    };

    run();
  }, [title, author, ingredients, onDone]);

  return (
    <div ref={ref} className="w-[600px] p-6 bg-background text-foreground">
      <Card className="border rounded-xl shadow-sm">
        <CardHeader>
          <div to={'/'} className="flex items-center gap-2 font-medium">
            <img src={logo} alt="Recipedia Logo" className="h-9" />
            Recipedia
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">By {author}</p>
        </CardHeader>

        <CardContent>
          {/* <h2 className="mb-3 text-base font-semibold">Ingredients checklist</h2> */}

          <div className="space-y-2 text-sm">
            {ingredients.map((ing, idx) => (
              <Label key={`${ing.name}-${idx}`} className="flex items-center gap-2">
                <Checkbox className="mt-[2px]" />
                <div className="flex gap-1">
                  <strong>{ing.name} </strong> <span>•</span>
                  <span>
                    {ing.amount} {ing.measurement || ''}
                  </span>
                </div>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
