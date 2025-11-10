"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { listCollection } from '@/lib/collections-client';

interface ToothImageRecord {
	id: string;
	toothId?: string;
	imageUrl?: string;
	caption?: string;
	takenAt?: string;
}

interface ToothMedicalRecord {
	id: string;
	toothId?: string;
	type?: string;
	notes?: string;
	createdAt?: string;
}

interface EnhancedToothDetailCardProps {
	toothId: string;
}

// Lightweight client-only component replacing previous implementation that
// accidentally bundled Prisma in the browser. Fetches data via generic
// collections API to avoid direct Prisma usage on the client.
export function EnhancedToothDetailCard({ toothId }: EnhancedToothDetailCardProps) {
	const [images, setImages] = React.useState<ToothImageRecord[]>([]);
	const [records, setRecords] = React.useState<ToothMedicalRecord[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const [allImages, allRecords] = await Promise.all([
					listCollection<ToothImageRecord>('tooth-images'),
					listCollection<ToothMedicalRecord>('tooth-medical-records')
				]);
				if (cancelled) return;
				setImages(allImages.filter(img => img.toothId === toothId));
				setRecords(allRecords.filter(r => r.toothId === toothId));
			} catch (e: any) {
				if (!cancelled) setError(e?.message || 'Failed to load tooth data');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => { cancelled = true; };
	}, [toothId]);

	return (
		<Card className="p-4 space-y-4">
			<h3 className="text-lg font-semibold">Tooth #{toothId}</h3>
			{loading && <p className="text-sm text-muted-foreground">Loading tooth data...</p>}
			{error && <p className="text-sm text-destructive">{error}</p>}
			{!loading && !error && (
				<div className="space-y-6">
					<div>
						<h4 className="font-medium mb-2">Images</h4>
						{images.length === 0 ? (
							<p className="text-xs text-muted-foreground">No images found.</p>
						) : (
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{images.map(img => (
									<figure key={img.id} className="flex flex-col gap-2">
										{img.imageUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={img.imageUrl} alt={img.caption || 'Tooth'} className="rounded-md border" />
										) : (
											<div className="h-24 flex items-center justify-center text-xs text-muted-foreground border rounded-md">No image URL</div>
										)}
										{img.caption && <figcaption className="text-xs text-muted-foreground">{img.caption}</figcaption>}
									</figure>
								))}
							</div>
						)}
					</div>
					<div>
						<h4 className="font-medium mb-2">Medical Records</h4>
						{records.length === 0 ? (
							<p className="text-xs text-muted-foreground">No records found.</p>
						) : (
							<ul className="space-y-2">
								{records.map(r => (
									<li key={r.id} className="text-xs flex flex-col gap-1 rounded-md border p-2">
										<span className="font-semibold">{r.type || 'Record'}</span>
										{r.notes && <span className="text-muted-foreground">{r.notes}</span>}
										{r.createdAt && (
											<span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
										)}
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			)}
		</Card>
	);
}

export default EnhancedToothDetailCard;
