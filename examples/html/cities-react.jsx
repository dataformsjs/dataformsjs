export function PageCities({match}) {
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/geonames/cities/:country/:region"
            lang={match.params.lang}
            country={match.params.country}
            region={match.params.region}
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowCities />}
            loadOnlyOnce={true}>
        </JsonData>
    );
}

export function ShowCities(props) {
    return (
        <React.Fragment>
            <h1>{i18n.text('Largest Cities in')} {props.params.country}, {props.params.region}</h1>

            <nav>
                <Link to={'/' + props.params.lang + '/'}>{i18n.text('Countries')}</Link>
                <Link to={'/' + props.params.lang + '/regions/' + props.params.country}>{i18n.text('Regions')}</Link>
            </nav>

            <InputFilter
                filter-selector="table"
                placeholder={i18n.text('Enter filter')} />

            <SortableTable
                data-sort-class-odd="row-odd"
                data-sort-class-even="row-even">
                <thead>
                    <tr>
                        <th>{i18n.text('Name')}</th>
                        <th>{i18n.text('Population')}</th>
                        <th>{i18n.text('Elevation')}</th>
                        <th>{i18n.text('Timezone')}</th>
                        <th>{i18n.text('Date Last Modified')}</th>
                    </tr>
                </thead>
                <tbody>
                    {props.data.cities.map(city => {
                        return (
                            <tr key={city.geonames_id}>
                                <td>
                                    <i class={props.params.country.toLowerCase() + ' flag'}></i>
                                    <Link to={'/' + props.params.lang + '/city/' + city.geonames_id}>{city.name}</Link>
                                </td>
                                <td className="align-right" data-value={city.population}>{format.number(city.population)}</td>
                                <td className="align-right" data-value={city.elevation}>{format.number(city.elevation)}</td>
                                <td>{city.timezone}</td>
                                <td className="align-right">{format.date(city.modification_date)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </SortableTable>
        </React.Fragment>
    )
}
