function retain_alpha_hashtag(str) {
    var result = str.replace(/[^a-zA-Z#\s]/g, "");
    console.log(result);
    return result;
}

function remove_hashtags(str) {
    var result = str.replace(/#([^\s]*)/g, "");
    console.log(result);
    return result;
}

function remove_punc(str) {
    var result = str.replace(/[\/\.,\-;]/g, " ");
    console.log(result);
    return result;
}

function remove_links(str) {
    var result = str.replace(/http[^\s]*/g, "");
    console.log(result);
    return result;
}

function remove_links(str) {
    var result = str.replace(/http[^\s]*/g, "");
    console.log(result);
    return result;
}

function remove_handle(str) {
    var result = str.replace(/@[^\s]*/g, "");
    console.log(result);
    return result;
}

function remove_extra_spaces(str) {
    var result = str.replace(/\s+/g, " ");
    result = result.trim();
    console.log(result);
    return result;
}