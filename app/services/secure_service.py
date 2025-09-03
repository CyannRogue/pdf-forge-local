from pypdf import PdfReader, PdfWriter


def encrypt_pdf(in_pdf, out_pdf, password):
    r = PdfReader(in_pdf)
    w = PdfWriter()
    for p in r.pages:
        w.add_page(p)
    w.encrypt(password)
    with open(out_pdf, "wb") as f:
        w.write(f)


def decrypt_pdf(in_pdf, out_pdf, password):
    r = PdfReader(in_pdf)
    if r.is_encrypted:
        try:
            ok = r.decrypt(password)
            if not ok:
                raise ValueError("Wrong password")
        except Exception as e:
            raise ValueError("Wrong password") from e
    w = PdfWriter()
    for p in r.pages:
        w.add_page(p)
    with open(out_pdf, "wb") as f:
        w.write(f)
