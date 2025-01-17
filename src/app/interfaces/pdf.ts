export type PDF = {
    id: number;
    description: string;
    created_at: number;
    file: {
      name: string;
      size: number;
      url: string;
      mime: string;
    };
  };