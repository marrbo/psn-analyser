interface TestimonialCardProps {
  testimonial: {
    name: string;
    role: string;
    avatar: string;
    content: string;
    rating: number;
    platform: string;
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-gray-900/50 to-black/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-700">
      {/* Quote icon */}
      <div className="absolute top-4 right-4 text-blue-500/20 text-6xl">"</div>
      
      {/* Rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-700'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-6 italic relative z-10">"{testimonial.content}"</p>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full border-2 border-gray-700 group-hover:border-blue-500 transition-colors"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <div className="font-semibold text-white">{testimonial.name}</div>
            <div className="text-sm text-gray-400">{testimonial.role}</div>
          </div>
        </div>

        {/* Platform */}
        <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
          {testimonial.platform}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
}