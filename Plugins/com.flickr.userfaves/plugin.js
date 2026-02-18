/// <reference path="../../Documentation/tapestry.d.ts" />

function verify() {

    sendRequest(`https://taestell-cloud-worker.taestell.workers.dev/tapestry/flickr/${user}/faves?validate=true`).then(text => {
        const jsonObject = JSON.parse(text);
        if (jsonObject.user && typeof jsonObject.user.username === 'string' && jsonObject.user.username.trim() !== '') {
            const verification = {
                displayName: `Faved by ${jsonObject.user.username} on Flickr`,
                icon: jsonObject.user.avatar
            };
            processVerification(verification);
        }
    });

}

function load() {

    sendRequest(`https://taestell-cloud-worker.taestell.workers.dev/tapestry/flickr/${user}/faves`).then(text => {
        const jsonObject = JSON.parse(text);
        const fetchedItems = jsonObject["items"];

        let items = [];

        // Convert fetchedItems to Tapestry Item objects
        for (const fetched of fetchedItems) {
            const item = Item.createWithUriDate(fetched.url, new Date(fetched.date));
            if (typeof fetched.title === 'string' && fetched.title.trim() !== '') {
                item.title = fetched.title;
            }
            if (typeof fetched.body === 'string' && fetched.body.trim() !== '') {
                item.body = fetched.body;
            }
            if (fetched.author) {
                const author = Identity.createWithName(fetched.author.name);
                author.username = fetched.author.username;
                author.uri = fetched.author.uri;
                author.avatar = fetched.author.avatar;
                item.author = author;
            }
            if (Array.isArray(fetched.attachments)) {
                item.attachments = fetched.attachments.map(att => {
                    // Only handle MediaAttachment for Flickr faves
                    return MediaAttachment.createWithUrl(att.url);
                });
            }
            /*if (Array.isArray(fetched.annotations)) {
                item.annotations = fetched.annotations.map(ann => {
                    return Annotation.createWithText(ann.text);
                });
            }*/
            items.push(item);
        }

        processResults(items);

    });

}