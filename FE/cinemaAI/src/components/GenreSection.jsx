const GENRES = [
  {
    label: 'Noir',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqoGihOYNDaYb_2fbcCyJ8UoKrtWEKO5-QqUzF7j_eyw-Sts8ZyMtT1wlsU2IJRvZnAR_EejX1a4e5HFDOuYkx9GHJeHLEVDfHvpI2soWIssE5qFH6mtjDOzLx3gVwlO7b-iy0YSunwuDDw6o0mD4cQ2gRagSfPtMmgbmjHmQEWjUCorHoCglwGgLszXdwKUYRWDsPhYL8ELSpH7ABJKgJTuP7tVQFcElyalFAe802udhiQP2ZXNPBpl0eNvPdxTy5z9v-0D6nTAd0',
  },
  {
    label: 'Action',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAG6Y3Iif-qo5QhdwGv_5vdxqv9y6wgt4eR5nLAdTiMSYVsCOdZ5Dpv3RTajTSKKIfUH9JGxodS4kkpT4-9Abx-_lTrGiQL6PfIbuJt0DknPHxFla-2NpoFvek0DGbK2PtDR07seYH2hR5EEeG3pkPQ0rs7mKbkMt2ovpJJOEV4InU9FAusWWZsRur-7NKyrB-J3q8tCCMEL-942v4bpNTKiX4BRpNMzjoYY4yIc_Sj-WD5DPQ1v1-75PP2_NJfB14yHBo7NUStnS9',
  },
  {
    label: 'Sci-Fi',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn7eR_WWrdaE9L0GnrP7-igA_VfsoAfn4xWOUM16SUdVRaDAuSHSpV6zYaja7RKMassP1zNH5H-bfALXtno7Rde107tUyz9m_ToJdZVG6z6X2BLzMWNy9nPD-Vl93ZduyAeIkpwGBtBYij59rNrOVT9w1d-icbobU7PVimuyeJLvk11QHY_izsx3rkQ4GfOwnafE-43rIvJfLEx6qka82YwAZ-3H3VP9Az8oNX-JGEhvQmB9Pihv9rjADuIm5K0rSONazZP1h6RGvr',
  },
  {
    label: 'Horror',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATE-FdfxAKkFpD_ys1USqskj3rZigWMdwSTmXuTxSN-Z92DSaEmWumYprAvDorHRqD0jcBl1235GmeyvIKFurWH_imGG7lZojTYuEFYfNaUUPT18fqRXfCmEIwOM1FDICo7MHee2Cnj-Sk2dpsb7j9R6O5V3f2OizAKJ_fIxauQvYMJDKuzhuJdUZ19ooPy5zW3PlcnWrntpyPzT4JNqoLik_UauJAMyWzyfMeuyx9Hu7Tg516LLbLMFkVNIOxtEU81zTSeDk5Dd-C',
  },
]

export default function GenreSection() {
  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-white/5">
      <h2 className="font-display-lg text-headline-xl text-on-surface mb-12 text-center">
        KHÁM PHÁ THỂ LOẠI
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {GENRES.map(({ label, imageUrl }) => (
          <div
            key={label}
            className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer"
          >
            <img
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
              src={imageUrl}
              alt={label}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-primary-container/20 transition-colors duration-300 flex items-center justify-center">
              <span className="font-headline-xl text-white tracking-widest uppercase">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
