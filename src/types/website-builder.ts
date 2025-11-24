export type WidgetType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'video' 
  | 'icon' 
  | 'section' 
  | 'column' 
  | 'divider' 
  | 'accordion' 
  | 'form' 
  | 'cta' 
  | 'social' 
  | 'card' 
  | 'alert'
  | 'navbar'
  | 'footer'
  | 'breadcrumb'
  | 'table'
  | 'list'
  | 'progressBar'
  | 'stats'
  | 'searchBar'
  | 'newsletter'
  | 'contactInfo'
  | 'gallery'
  | 'carousel'
  | 'audioPlayer'
  | 'productCard'
  | 'pricing'
  | 'testimonial'
  | 'countdown'
  | 'map'
  | 'weather'
  | 'socialShare'
  | 'rating'
  | 'timeline'
  | 'anchor';

export interface Widget {
  id: string;
  type: WidgetType;
  props: Record<string, any>;
  children?: Widget[];
}

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  icon: React.ElementType;
  category: 'basic' | 'layout' | 'interactive' | 'content' | 'navigation' | 'data' | 'forms' | 'media' | 'commerce' | 'special';
  defaultProps: Record<string, any>;
}

export interface NavLink {
  label: string;
  href: string;
}
