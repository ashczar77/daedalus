import { Link } from 'react-router-dom'
import { problems } from '../problems/registry'
import './CatalogPage.css'

/** Landing page: brand + links into each Phase 1 problem pack. */
export function CatalogPage() {
  return (
    <div className="catalog">
      <header className="catalog__hero">
        <p className="catalog__eyebrow">Step-through algorithm lab</p>
        <h1 className="catalog__brand">Daedalus</h1>
        <p className="catalog__lede">
          Watch interview patterns execute line by line — arrays, maps, and
          pointers animated in sync with Java, Kotlin, and Python.
        </p>
      </header>

      <section className="catalog__list" aria-label="Problems">
        <div className="catalog__list-head">
          <h2>Problem catalog</h2>
          <p>{problems.length} problems ready to step through</p>
        </div>
        <ul>
          {problems.map((problem) => (
            <li key={problem.id}>
              <Link to={`/problems/${problem.id}`} className="catalog__card">
                <div className="catalog__card-top">
                  <span className="catalog__lc">#{problem.lcNumber}</span>
                  <span
                    className={`catalog__diff is-${problem.difficulty.toLowerCase()}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <h3>{problem.title}</h3>
                <p>{problem.pattern}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
