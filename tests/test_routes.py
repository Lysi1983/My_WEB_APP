import pytest

from my_web import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'My work experience' in response.data or b'my work experience' in response.data

def test_work_data_route(client):
    response = client.get('/work_data')
    assert response.status_code == 200
    # check for table headings or other unique text
    assert b'Work Place' in response.data
