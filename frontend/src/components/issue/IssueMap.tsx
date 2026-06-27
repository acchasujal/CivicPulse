import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Issue } from '@/api/types';
import { getImageUrl } from '@/utils/getImageUrl';
import { getLocalityName } from '@/utils/getLocalityName';
import { humanizeIssueType } from '@/utils/issueHelpers';
import { Loader2, AlertTriangle } from 'lucide-react';

interface IssueMapProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  className?: string;
}

export const IssueMap: React.FC<IssueMapProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  // Group reports by cluster_id or issue.id (if solitary) using existing Agent 2 data
  const groupedData = useMemo(() => {
    const groups: Record<string, Issue[]> = {};
    issues.forEach((issue) => {
      const key = issue.cluster_id || `solitary-${issue.id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(issue);
    });

    return Object.entries(groups).map(([key, reports]) => {
      // Sort reports by created_at desc so latest is primary
      const sorted = [...reports].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const primary = sorted[0];
      return {
        key,
        reports: sorted,
        primary,
        latitude: primary.latitude,
        longitude: primary.longitude,
        maxSeverity: Math.max(...reports.map((r) => r.severity)),
      };
    });
  }, [issues]);

  // Load Google Maps Script dynamically
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setMapsLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const callbackName = 'initGoogleMapsCallback';
    
    // Set global callback
    (window as any)[callbackName] = () => {
      setMapsLoaded(true);
      delete (window as any)[callbackName];
    };

    const scriptId = 'google-maps-js-api';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setLoadError(true);
      };
      document.head.appendChild(script);
    } else {
      // Script is already injected but callback not triggered yet
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          setMapsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 300);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance) return;

    try {
      const g = (window as any).google;
      const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai Center
      const instance = new g.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        maxZoom: 18,
        minZoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      infoWindowRef.current = new g.maps.InfoWindow();
      setMapInstance(instance);
    } catch (err) {
      console.error('Failed to instantiate Google Map:', err);
      setLoadError(true);
    }
  }, [mapsLoaded, mapInstance]);

  // Update Markers & Auto-Fit Bounds
  useEffect(() => {
    if (!mapInstance || !infoWindowRef.current) return;

    const g = (window as any).google;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (groupedData.length === 0) {
      mapInstance.setCenter({ lat: 19.0760, lng: 72.8777 });
      mapInstance.setZoom(12);
      return;
    }

    const bounds = new g.maps.LatLngBounds();

    groupedData.forEach(({ reports, primary, latitude, longitude, maxSeverity }) => {
      const position = { lat: latitude, lng: longitude };
      bounds.extend(position);

      // Severity-based custom SVG marker color
      let markerColor = '#16A34A'; // severity 1
      if (maxSeverity >= 5) markerColor = '#E11D48';      // Red (Critical)
      else if (maxSeverity === 4) markerColor = '#EA580C'; // Orange (High)
      else if (maxSeverity === 3) markerColor = '#D97706'; // Amber (Moderate)
      else if (maxSeverity === 2) markerColor = '#EAB308'; // Low (Yellow)

      // Glassmorphism SVG marker
      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="${markerColor}" fill-opacity="0.2" />
          <path fill="${markerColor}" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      const marker = new g.maps.Marker({
        position,
        map: mapInstance,
        title: `${humanizeIssueType(primary.issue_type, primary.description)} (${reports.length} reports)`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
          scaledSize: new g.maps.Size(38, 38),
          anchor: new g.maps.Point(19, 38),
        },
        label: reports.length > 1 ? {
          text: reports.length.toString(),
          color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: '700',
        } : undefined,
      });

      // Marker click handler
      marker.addListener('click', () => {
        onSelectIssue(primary.id);

        const infoContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 220px; font-size: 11px; line-height: 1.5; color: #334155;">
            <div style="height: 110px; width: 100%; border-radius: 6px; overflow: hidden; background-color: #f1f5f9; margin-bottom: 8px;">
              <img src="${getImageUrl(primary.photo_url)}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
              ${humanizeIssueType(primary.issue_type, primary.description)}
            </div>
            <div style="color: #64748b; font-size: 10px; font-weight: 500; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              📍 ${getLocalityName(primary.latitude, primary.longitude)}
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
              <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid #f1f5f9; background-color: #f8fafc; text-transform: uppercase;">
                Severity ${primary.severity}/5
              </span>
              <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #0d9488; background-color: #f0fdfa; border: 1px solid #ccfbf1; text-transform: uppercase;">
                ${primary.status}
              </span>
            </div>
            ${reports.length > 1 ? `
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 9px; font-weight: 700; color: #0284c7;">
                🛡️ Clustered Case File: ${reports.length} Reports Compiled
              </div>
            ` : ''}
          </div>
        `;

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstance, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds
    if (groupedData.length === 1) {
      mapInstance.setCenter({ lat: groupedData[0].latitude, lng: groupedData[0].longitude });
      mapInstance.setZoom(14);
    } else {
      mapInstance.fitBounds(bounds);
      // Avoid excessive zooming on initialization
      const listener = g.maps.event.addListener(mapInstance, 'bounds_changed', () => {
        if (mapInstance.getZoom()! > 16) mapInstance.setZoom(16);
        g.maps.event.removeListener(listener);
      });
    }
  }, [groupedData, mapInstance]);

  // Center Map & Open InfoWindow when selectedIssueId changes from list interaction
  useEffect(() => {
    if (!mapInstance || !selectedIssueId || markersRef.current.length === 0) return;

    const g = (window as any).google;

    // Find the corresponding marker index
    const targetGroup = groupedData.find((g) => g.reports.some((r) => r.id === selectedIssueId));
    if (!targetGroup) return;

    const markerIndex = groupedData.indexOf(targetGroup);
    const marker = markersRef.current[markerIndex];

    if (marker) {
      mapInstance.panTo(marker.getPosition()!);
      mapInstance.setZoom(15);
      // Trigger click event programmatically to show InfoWindow
      g.maps.event.trigger(marker, 'click');
    }
  }, [selectedIssueId, mapInstance, groupedData]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-medium text-slate-500 font-sans text-xs min-h-[300px] text-center select-none">
        <AlertTriangle className="text-amber-500 mb-2 shrink-0" size={24} />
        <span className="font-semibold block mb-1 text-slate-700">Google Maps Unavailable</span>
        <span>The map module could not be initialized. Operating in list-only fallback mode.</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {!mapsLoaded && (
        <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 select-none z-10 animate-fade">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
            Configuring Operations Map...
          </span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '300px' }} />
    </div>
  );
};
