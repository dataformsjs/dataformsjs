'use strict';

function ShowCategories(props) {
    return (
        <section>
            <div>
                <InputFilter
                    type="text"
                    filter-selector=".image-categories li"
                    filter-results-selector="h1"
                    filter-results-text-all={i18n.text('{totalCount} Image Categories')}
                    filter-results-text-filtered={i18n.text('Showing {displayCount} of {totalCount} Image Categories')}
                    placeholder={i18n.text("Enter filter, example [dog] or [cat]")} />
            </div>

            <div className="content">
                <h1></h1>
                <ul className="image-categories">
                    {props.data && props.data.categories && props.data.categories.map((category, index) => {
                        return (
                            <li key={index}>{category}</li>
                        )
                    })}                    
                </ul>
            </div>
        </section>
    )
}

function PageCategories() {
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/ai-ml/categories/resnet50"
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowCategories />}
            loadOnlyOnce={true}>
        </JsonData>
    );
}
