import MovieCard from './MovieCard'

const MOVIES = [
  {
    id: 1,
    title: 'Thành Phố Ngầm',
    genre: 'Hành Động',
    duration: '120 phút',
    ageRating: 'PG-13',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_BUcLsoMWpQf4YpLMl0Ho5VcX8JGfg0GU86oUP9aMqgZ0tGubmPS5o5eh3oBsm7XwZD1hLZCrR3D_rbn7aURvKBNfdDZOE9upQU9x1G6oQT4B8K4zQ_MW9nZkXLYZK_g29H2aKDB1pP-20mJCSC-7HUHsXmgDqPmlBVZcrdAUX9-EyJMHSwysWK1MW_H5SCLPafLOT8IoRJhb-FwnL4BFih74wZMFWgIwxkKPcA0sPqRALaGvLoIetzHtbj07ExRgEbdm8US8ejgC',
    delay: 'stagger-1',
  },
  {
    id: 2,
    title: 'Ký Ức Đen Trắng',
    genre: 'Tâm Lý',
    duration: '105 phút',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVV0nJn5hsiaEa2XZvHc8a8DEupf3gQKol9IRIbAYzCiwp7XxFPCyFny2azwSYtFpBb1Pxuv5tnz3Io1RxUj_LCrFLlCz89qf-D-vOcfHSFPaq_BXfB63UEHZn6KEMabxMQct1K2AR0s6u_OwMCD62unGLbaaUJWA45lY-7-_o8yJIoiwqHa52bEdEIROqaNfJ3UbaGTu-bFChKYaKXOzvf4dWlbVDiaBnnWstWhNpPza7-zVDfFHRpZ5L9_1-mDDpEjIojgpL0Ej7',
    delay: 'stagger-2',
  },
  {
    id: 3,
    title: 'Vượt Không Gian',
    genre: 'Viễn Tưởng',
    duration: '145 phút',
    badge: 'HOT',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZYYfwlEnc_elLC4oh7k8yzGzB_Tz6O_5yFnnpTDlHLlijmxiDuwehDqi2AZqP9IsnBQvcLN5DXtYxXexi8WNohHPMa8fP0XW5evL7XcFcRyY0ZobpTWyttN43--TOGgcL-u1u60O4FZqPLzQ5L2hFW0pvw2aDbPrK96yzLnQqYWw8fNidqfbUY_olLBH2e3Xc_MxZNMjPDA2Mk3EDwY2My4lEz1PnS9i3bUrFF86KfFcH6quQQ1gPZUjbodad8dBpjo6k1zY3lQbb',
    delay: 'stagger-3',
  },
  {
    id: 4,
    title: 'Ảo Ảnh',
    genre: 'Kinh Dị',
    duration: '95 phút',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBC-Q0e1DiSYTrBTZ9BRp0iExOb4_e7yCR4WGnJz2ymUpZShFl-wr7MyMz7gTRLutgUcbRNTkeKY5_oIJVkboZDJbZ1Fn9HwKVni7bXyHtuFPPAMZcW2R3RO9PP5CQygXe_YPSV260sPx4xcOz7x2b81EpHkolhw-9A7WYvCJpbTe-gXjQwFfHEZ044XjJ0iXtNCePPnPXubz8AiA_XuLHcRYxc-3zjmEXdn3PUaeaz06e2glETsLo-JBBGooBAbX3zflDWA_FPOgkK',
    delay: 'stagger-4',
    className: 'hidden md:block',
  },
  {
    id: 5,
    title: 'Tốc Độ Đỏ',
    genre: 'Hành Động',
    duration: '110 phút',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB_SIJPT-YFIHPYGQlUxV5-hlHw9JyWK1CJh7oVHJhNumxokYlNkWgsmCvrfoE1QPX7783v9kLkDPTUztAlTHT8Ex6dFle9-DnKWd_yFzNjEMkIUPbe5laO_rR-qY7HWI3mWqGKss35Vlujq73IK9aE1dAatY9148rJIrjkQUueenS-jJMA1eqSRS-DhiAzRrElxIvZuIG1_YLyyyAdUz1ujBE_qAoTNDLuSFJffx-I60M5nGYQNy_f6sEUW_tDoncOkVdrASXGVjIC',
    delay: 'stagger-5',
    className: 'hidden lg:block',
  },
]

export default function NowShowingSection() {
  return (
    <section className="py-16 px-margin-desktop max-w-container-max mx-auto md:px-margin-mobile">
      <div className="flex justify-between items-end mb-8 opacity-0 animate-fade-in-up stagger-1">
        <h2 className="font-headline-xl text-headline-xl text-white">Phim Đang Chiếu</h2>
        <a
          className="text-primary hover:text-white transition-all duration-300 font-label-sm text-label-sm flex items-center group"
          href="#"
        >
          XEM TẤT CẢ
          <span className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform duration-300">
            arrow_forward
          </span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {MOVIES.map((movie) => (
          <MovieCard key={movie.title} {...movie} />
        ))}
      </div>
    </section>
  )
}
