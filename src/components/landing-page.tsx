import { ArrowRight, BadgeCheck, ClipboardCheck, Search, ShoppingCart, UserRound, Users } from 'lucide-react'

const STEPS = [
  { icon: ClipboardCheck, number: '01', title: 'Выберите аллергии', body: "Отметьте аллергены в профиле." },
  { icon: Search, number: '02', title: 'Найдите продукт', body: "Найдите нужный товар в каталоге." },
  { icon: ShoppingCart, number: '03', title: 'Закажите безопасное', body: "Опасные позиции сразу видны по цвету \"светофора\"." },
]

const RATING_DOTS = ['bg-[#2FA24F]', 'bg-[#d9b25f]', 'bg-[#d98080]']

export default function LandingPage({ leaving, onStart }: { leaving: boolean; onStart: () => void }) {
  return (
    <main
      className={`fixed inset-0 z-50 overflow-y-auto bg-[#f7f8f6] text-[#28312b] transition-all duration-500 ease-in-out ${
        leaving ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="relative flex min-h-dvh w-full flex-col p-2.5 sm:p-4 lg:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-full bg-linear-to-r from-[#e3ece5] via-white to-[#f6efe0] opacity-80 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-md flex-1 grid-cols-1 gap-2.5 md:max-w-3xl md:grid-cols-2 md:gap-3 lg:max-w-6xl lg:gap-4">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl bg-[#051B41] p-4 text-white md:col-span-2 md:p-6 lg:p-8">
            <img alt="SafeBite" className="h-7 w-auto" src={import.meta.env.BASE_URL + 'uploads/safebite-logo.png'} />

            <div className="mt-3 flex flex-col gap-3.5 md:mt-5 md:flex-row md:items-end md:justify-between md:gap-8">
              <div className="min-w-0 md:max-w-xl">
                <h1 className="text-balance text-[1.4rem] font-bold leading-[1.12] tracking-tight sm:text-3xl lg:text-[2.5rem]">
                  Безопасная еда без риска аллергии за 1&nbsp;секунду
                </h1>
                <p className="mt-2 text-[13px] leading-snug text-[#a9bcd8] md:text-base">
                  Умный поиск товаров с автоматической индикацией опасных ингредиентов.
                </p>
              </div>

              <div className="flex flex-col gap-2 md:w-72 lg:w-80">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[#2FA24F]" strokeWidth={2} />
                  <p className="text-[11px] leading-snug font-medium text-white sm:text-[12px]">
                    100% автопроверка состава по профилю аллергенов.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[14px] font-semibold text-[#051B41] transition-transform duration-150 hover:bg-[#e9efea] active:scale-[0.98] md:text-[15px]"
                >
                  Начать поиск
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-[#e5e8e4] md:p-5">
            <h2 className="text-[13px] font-bold tracking-tight text-[#28312b] md:text-base">Как это работает</h2>
            <div className="mt-2.5 flex flex-1 flex-col gap-2 md:gap-2.5">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-1 flex-col justify-between rounded-xl bg-[#f8faf8] p-3 ring-1 ring-[#e5e8e4] md:p-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[26px] font-bold leading-none tracking-tight text-[#cfd6d0] md:text-4xl">
                      {step.number}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#051B41] md:h-11 md:w-11">
                      <step.icon className="h-4 w-4 text-[#2FA24F] md:h-5 md:w-5" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-[14px] font-bold leading-tight text-[#28312b] md:text-[17px]">{step.title}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-[#687169] md:text-[14px]">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full bg-[#f4f5f2] py-1.5">
              {RATING_DOTS.map((dot) => (
                <span key={dot} className={`h-2 w-2 rounded-full ${dot}`} />
              ))}
              <span className="ml-1 text-[11px] font-medium text-[#687169] md:text-[12px]">Цветовой рейтинг товара</span>
            </div>
          </section>

          {/* Right column on desktop */}
          <div className="contents md:flex md:flex-col md:gap-3 lg:gap-4">
            <section className="rounded-2xl bg-white p-3.5 ring-1 ring-[#e5e8e4] md:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4f5f2]">
                  <UserRound className="h-3.5 w-3.5 text-[#273a2d]" strokeWidth={2} />
                </div>
                <h2 className="text-[13px] font-bold tracking-tight text-[#28312b] md:text-base">Для кого</h2>
              </div>
              <p className="mt-2 text-[12.5px] leading-snug text-[#687169] md:text-[14px]">
                Для студентов, спортсменов, людей с пищевыми аллергиями, для всех членов семьи.
              </p>
            </section>

            <section className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-[#e5e8e4] md:flex-1 md:p-5">
              <h2 className="text-[13px] font-bold tracking-tight text-[#28312b] md:text-base">Сколько стоит</h2>
              <div className="mt-2.5 grid flex-1 grid-cols-2 gap-2 md:gap-2.5">
                <div style={{ backgroundColor: "#e2e8f0" }} className="flex flex-col justify-between rounded-xl p-3 ring-1 ring-[#e5e8e4] bg-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#2FA24F]" strokeWidth={2} />
                    <p className="text-[11px] font-semibold text-[#424a43] md:text-[12px]">Первые 14 дней</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-[#28312b] md:text-3xl">0 ₽</p>
                    <p className="text-[11px] leading-snug text-[#858d86] md:text-[12px]">Бесплатный период</p>
                  </div>
                </div>
                <div style={{ backgroundColor: "#e2e8f0" }} className="flex flex-col justify-between rounded-xl p-3 bg-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#2FA24F]" strokeWidth={2} />
                    <p className="text-[11px] font-semibold text-[#e5ece7] md:text-[12px]">Далее</p>
                  </div>
                  <div>
                    <p style={{ color: "#000000" }} className="text-2xl font-bold tracking-tight md:text-3xl text-black">300/550 ₽</p>
                    <p style={{ color: "#64748b" }} className="text-[11px] leading-snug md:text-[12px] text-slate-500">в месяц для пользователей</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
