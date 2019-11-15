
export function PageRegions({match}) {
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/geonames/regions/:country"
            lang={match.params.lang}
            country={match.params.country}
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowRegions />}
            loadOnlyOnce={true}>
        </JsonData>
    );
}

export function ShowRegions(props) {
    return (
        <React.Fragment>
            <h1>{i18n.text('Regions for Country Code')} {props.params.country}</h1>

            <nav>
                <Link to={'/' + props.params.lang + '/'}>{i18n.text('Countries')}</Link>
            </nav>

            <InputFilter
                filter-selector="table"
                filter-results-selector="h1"
                filter-results-text-all={'{totalCount} ' + i18n.text('Regions for Country Code') + ' ' + props.params.country}
                filter-results-text-filtered={i18n.text('Showing {displayCount} of {totalCount} Regions for Country Code') + ' ' + props.params.country}
                placeholder={i18n.text('Enter filter')} />

            <SortableTable
                data-sort-class-odd="row-odd"
                data-sort-class-even="row-even">
                <thead>
                    <tr>
                        <th>{i18n.text('Code')}</th>
                        <th>{i18n.text('Name')}</th>
                        <th>{i18n.text('Population')}</th>
                        <th>{i18n.text('Timezone')}</th>
                        <th>{i18n.text('Date Last Modified')}</th>                                    
                    </tr>
                </thead>
                <tbody>
                    {props.data.regions.map(region => {
                        return (
                            <tr key={region.admin1_code}>
                                <td><Link to={'/' + props.params.lang + '/cities/' + props.params.country + '/' + region.admin1_code}>{region.admin1_code}</Link></td>
                                <td>
                                    <i class={props.params.country.toLowerCase() + ' flag'}></i>
                                    <span>{region.name}</span>
                                </td>
                                <td className="align-right" data-value={region.population}>{format.number(region.population)}</td>
                                <td>{region.timezone}</td>
                                <td className="align-right">{format.date(region.modification_date)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </SortableTable>
        </React.Fragment>
    )
}
