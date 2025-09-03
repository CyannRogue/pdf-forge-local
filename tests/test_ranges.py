from app.services.organize_service import _parse_ranges

def test_parse_single_pages():
    assert _parse_ranges("1,3,5", 10) == [0, 2, 4]

def test_parse_ranges_mixed():
    assert _parse_ranges("1-3,5,7-8", 10) == [0, 1, 2, 4, 6, 7]

def test_parse_out_of_bounds_ignored():
    assert _parse_ranges("0,1-2,999", 3) == [0, 1]

def test_parse_with_spaces_and_empty_parts():
    assert _parse_ranges(" 1 - 2 , , 4 ", 10) == [0, 1, 3]
